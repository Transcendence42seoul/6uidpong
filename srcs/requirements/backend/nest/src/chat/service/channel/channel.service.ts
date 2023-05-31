import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateRequest } from "src/chat/dto/channel/create-request";
import { ChannelResponse } from "src/chat/dto/channel/channel-response";
import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { Channel } from "src/chat/entity/channel/channel.entity";
import * as bcryptjs from "bcryptjs";
import { DataSource, MoreThanOrEqual, Repository, InsertResult } from "typeorm";
import { WsException } from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { ChatResponse } from "src/chat/dto/channel/chat-response";
import { BanService } from "./ban.service";
import { MuteService } from "./mute.service";
import { Ban } from "src/chat/entity/channel/ban.entity";

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelUser)
    private readonly channelUserRepository: Repository<ChannelUser>,
    @InjectRepository(ChannelChat)
    private readonly chatRepository: Repository<ChannelChat>,
    private readonly banService: BanService,
    private readonly muteService: MuteService,
    private readonly dataSource: DataSource
  ) {}

  async findAllChannels(): Promise<ChannelResponse[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'count(*)                     AS "memberCount"',
        "CASE WHEN channel.password = '' THEN false \
              ELSE true                             \
              END                     AS \"isLocked\"",
      ])
      .innerJoin(
        "channel.channelUsers",
        "channel_users",
        "channel.is_public = true"
      )
      .groupBy("channel.id")
      .addGroupBy("channel.title")
      .addGroupBy("channel.is_public")
      .addGroupBy("channel.password")
      .orderBy("channel.title", "ASC")
      .getRawMany();
  }

  async findChannelOrFail(channelId: number): Promise<Channel> {
    return await this.channelRepository.findOneOrFail({
      where: {
        id: channelId,
      },
    });
  }

  async findMyChannels(userId: number): Promise<ChannelResponse[]> {
    return await this.channelUserRepository
      .createQueryBuilder("channel_users")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'channel.is_public            AS "isPublic"',
        'channel_users.new_msg_count  AS "newMsgCount"',
        'member_count.count           AS "memberCount"',
      ])
      .innerJoin("channel_users.channel", "channel")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select(["sub.channel_id", "count(*) AS count"])
            .from(ChannelUser, "sub")
            .groupBy("sub.channel_id"),
        "member_count",
        "channel_users.channel_id = member_count.channel_id"
      )
      .where("channel_users.user_id = :userId")
      .orderBy("channel.title", "ASC")
      .setParameter("userId", userId)
      .getRawMany();
  }

  async create(userId: number, body: CreateRequest): Promise<Channel> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newChannel: InsertResult = await queryRunner.manager.insert(
        Channel,
        {
          title: body.title,
          isPublic: body.isPublic,
          password:
            typeof body.password === "undefined"
              ? ""
              : await bcryptjs.hash(body.password, await bcryptjs.genSalt()),
        }
      );
      await queryRunner.manager.insert(ChannelUser, {
        channelId: newChannel.identifiers[0].id,
        userId,
        isOwner: true,
        isAdmin: true,
      });

      await queryRunner.commitTransaction();

      return await this.channelRepository.findOneBy({
        id: newChannel.identifiers[0].id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async join(
    userId: number,
    info: { channelId: number; password: string },
    client: Socket
  ): Promise<ChatResponse[]> {
    const { channelId, password } = info;
    let channelUser: ChannelUser;
    try {
      channelUser = await this.findUser(channelId, userId);
    } catch {
      await this.authenticate(channelId, userId, password);
      channelUser = await this.insertUser(channelId, userId);
    }
    client.join("c" + channelId);
    const chats: ChannelChat[] = await this.findChats(channelUser);
    return chats.map((chat) => new ChatResponse(chat));
  }

  async deleteChannel(channelId: number, userId: number): Promise<void> {
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelRepository.delete(channelId);
  }

  async findUser(channelId: number, userId: number): Promise<ChannelUser> {
    return await this.channelUserRepository.findOneOrFail({
      relations: {
        user: true,
      },
      where: {
        channelId,
        userId,
      },
    });
  }

  async insertUser(channelId: number, userId: number): Promise<ChannelUser> {
    await this.channelUserRepository.insert({
      channelId,
      userId,
    });
    return await this.channelUserRepository.findOneBy({ channelId, userId });
  }

  async invite(
    inviterId: number,
    info: { channelId: number; userIds: number[] }
  ): Promise<void> {
    const { channelId, userIds } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, inviterId);
    if (!channelUser.isAdmin) {
      throw new WsException("permission denied");
    }
    await this.channelUserRepository.insert(
      userIds.map((id) => ({ channelId, id }))
    );
  }

  async kick(
    userId: number,
    info: { channelId: number; userId: number },
    server: Namespace
  ): Promise<void> {
    const { channelId, userId: kickUserId } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    const kickChannelUser: ChannelUser = await this.findUser(
      channelId,
      kickUserId
    );
    if (
      !channelUser.isAdmin ||
      kickChannelUser.isOwner ||
      (!channelUser.isOwner && kickChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    await this.channelUserRepository.delete({ channelId, userId: kickUserId });
    if (kickChannelUser.user.status === "online") {
      const roomName: string = "c" + info.channelId;
      const channelSockets = await server.in(roomName).fetchSockets();
      const kickUserSocket = channelSockets.find(
        (socket) => socket.id === kickChannelUser.user.socketId
      );
      if (kickUserSocket) {
        kickUserSocket.leave(roomName);
        kickUserSocket.emit("kicked-channel");
      }
    }
  }

  async mute(
    userId: number,
    info: { channelId: number; userId: number; limitedAt: Date }
  ): Promise<void> {
    const { channelId, userId: muteUserId, limitedAt } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    const muteChannelUser: ChannelUser = await this.findUser(
      channelId,
      muteUserId
    );
    if (
      !channelUser.isAdmin ||
      muteChannelUser.isOwner ||
      (!channelUser.isOwner && muteChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    await this.muteService.upsert(channelId, userId, limitedAt);
  }

  async ban(
    userId: number,
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const { channelId, userId: banUserId } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    const banChannelUser: ChannelUser = await this.findUser(
      channelId,
      banUserId
    );
    if (
      !channelUser.isAdmin ||
      banChannelUser.isOwner ||
      (!channelUser.isOwner && banChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ChannelUser, { channelId, banUserId });
      await queryRunner.manager.insert(Ban, { channelId, userId: banUserId });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unban(
    userId: number,
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.findUser(
      info.channelId,
      userId
    );
    if (!channelUser.isAdmin) {
      throw new WsException("permission denied");
    }
    await this.banService.delete(info.channelId, info.userId);
  }

  async findChats(channelUser: ChannelUser): Promise<ChannelChat[]> {
    const { channelId, createdAt } = channelUser;
    return await this.chatRepository.find({
      relations: {
        user: true,
      },
      where: {
        channel: {
          id: channelId,
        },
        createdAt: MoreThanOrEqual(createdAt),
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

  async authenticate(
    channelId: number,
    userId: number,
    password: string
  ): Promise<void> {
    if (await this.banService.has(channelId, userId)) {
      throw new WsException("can't join because banned");
    }
    const channel: Channel = await this.findChannelOrFail(channelId);
    if (
      channel.password.length !== 0 &&
      (typeof password === "undefined" ||
        !(await bcryptjs.compare(channel.password, password)))
    ) {
      throw new WsException("invalid password");
    }
  }

  async findUsers(channelId: number): Promise<ChannelUser[]> {
    return await this.channelUserRepository.find({
      relations: {
        user: true,
      },
      where: {
        channelId,
      },
      order: {
        createdAt: "ASC",
        user: {
          nickname: "ASC",
        },
      },
    });
  }

  async findAdmins(channelId: number): Promise<ChannelUser[]> {
    return await this.channelUserRepository.find({
      relations: {
        user: true,
      },
      where: {
        channelId,
        isAdmin: true,
      },
      order: {
        createdAt: "ASC",
        user: {
          nickname: "ASC",
        },
      },
    });
  }

  async send(
    userId: number,
    channelId: number,
    message: string,
    server: Namespace
  ): Promise<void> {
    const sockets = await server.in("c" + channelId).fetchSockets();
    const channelUsers: ChannelUser[] = await this.findUsers(channelId);
    const notJoined: ChannelUser[] = channelUsers.filter(
      (channelUser) =>
        !sockets.some((socket) => socket.id === channelUser.user.socketId)
    );
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newChat: InsertResult = await queryRunner.manager.insert(
        ChannelChat,
        {
          user: {
            id: userId,
          },
          channel: {
            id: channelId,
          },
          message,
        }
      );
      await queryRunner.manager.increment(
        ChannelUser,
        notJoined,
        "newMsgCount",
        1
      );
      const onlineSockets: string[] = channelUsers
        .filter((channelUser) => channelUser.user.status === "online")
        .map((onlineChannelUser) => onlineChannelUser.user.socketId);
      const chat: ChannelChat = await this.chatRepository.findOneBy({
        id: newChat.identifiers[0].id,
      });
      server.to(onlineSockets).emit("send-channel", new ChatResponse(chat));

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async exit(channelId: number, userId: number, client: Socket): Promise<void> {
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    if (channelUser.isOwner) {
      throw new WsException(
        "The owner cannot exit the channel. Please transfer ownership to another user and try again."
      );
    }
    const primaryKey = { channelId, userId };
    await this.channelUserRepository.delete(primaryKey);
    client.leave("c" + channelId);
  }

  async updatePassword(
    userId: number,
    info: { channelId: number; password: string }
  ) {
    const { channelId, password } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelRepository.update(channelId, {
      password:
        typeof password === "undefined"
          ? ""
          : await bcryptjs.hash(password, await bcryptjs.genSalt()),
    });
  }

  async transferOwnership(
    userId: number,
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const { channelId, userId: newOwnerId } = info;
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const oldOwnerPk = { channelId, userId: newOwnerId };
      const newOwnerPk = { channelId, userId };
      await queryRunner.manager.update(ChannelUser, oldOwnerPk, {
        isOwner: false,
        isAdmin: false,
      });
      await queryRunner.manager.update(ChannelUser, newOwnerPk, {
        isOwner: true,
        isAdmin: true,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateAdmin(
    userId: number,
    info: { channelId: number; userId: number; value: boolean }
  ): Promise<void> {
    const { channelId, userId: targetId, value } = info;
    const channelUser: ChannelUser = await this.findUser(
      info.channelId,
      userId
    );
    const targetChannelUser: ChannelUser = await this.findUser(
      channelId,
      targetId
    );
    if (!channelUser.isOwner || targetChannelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelUserRepository.update(
      { channelId, userId: targetId },
      {
        isAdmin: value,
      }
    );
  }
}
