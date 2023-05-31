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
import { User } from "src/user/entity/user.entity";
import { channel } from "diagnostics_channel";
import { Mute } from "src/chat/entity/channel/mute.entity";

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
    channelId: number,
    password: string,
    client: Socket
  ): Promise<ChatResponse[]> {
    let channelUser: ChannelUser;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      try {
        channelUser = await this.findUser(channelId, userId);
      } catch {
        await this.authenticate(channelId, userId, password);
        channelUser = await this.insertUser(channelId, userId);
      }
      const systemMessage: string = `${channelUser.user.nickname} has joined`;
      await this.sendSystemMsg(userId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    client.join("c" + channelId);
    const chats: ChannelChat[] = await this.findChats(channelUser);
    return chats.map((chat) => new ChatResponse(chat));
  }

  async deleteChannel(
    channelId: number,
    userId: number,
    client: Socket
  ): Promise<void> {
    const channelUser: ChannelUser = await this.findUser(channelId, userId);
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelRepository.delete(channelId);
    client.to("c" + channelId).emit("delete-channel", { id: channelId });
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
    channelId: number,
    userIds: number[],
    client: Socket
  ): Promise<void> {
    const inviter: ChannelUser = await this.findUser(channelId, inviterId);
    if (!inviter.isAdmin) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(
        ChannelUser,
        userIds.map((id) => ({ channelId, id }))
      );
      const invitee: ChannelUser = await this.findUser(channelId, userIds[0]);
      const systemMessage: string = `was added by ${
        inviter.user.nickname
      }. Also, ${invitee.user.nickname} and ${userIds.length - 1} others joined.
      `;
      await this.sendSystemMsg(userIds[0], channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async kick(
    userId: number,
    channelId: number,
    kickedId: number,
    client: Socket
  ): Promise<void> {
    const kicker: ChannelUser = await this.findUser(channelId, userId);
    const kicked: ChannelUser = await this.findUser(channelId, kickedId);
    if (
      !kicker.isAdmin ||
      kicked.isOwner ||
      (!kicker.isOwner && kicked.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const kickedPk = {
        channelId,
        userId: kickedId,
      };
      await queryRunner.manager.delete(ChannelUser, kickedPk);
      if (kicked.user.status === "online") {
        const kickedSocket = await client
          .to(kicked.user.socketId)
          .fetchSockets();
        kickedSocket[0].leave("c" + channelId);
        kickedSocket[0].emit("kicked-channel", { id: channelId });
      }
      const systemMessage: string = `${kicked.user.nickname} has been kicked by ${kicker.user.nickname}`;
      await this.sendSystemMsg(kickedId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async mute(
    muterId: number,
    channelId: number,
    mutedId: number,
    time: number,
    client: Socket
  ): Promise<void> {
    const muter: ChannelUser = await this.findUser(channelId, muterId);
    const muted: ChannelUser = await this.findUser(channelId, mutedId);
    if (!muter.isAdmin || muted.isOwner || (!muter.isOwner && muted.isAdmin)) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.upsert(
        Mute,
        {
          channelId,
          userId: mutedId,
          limitedAt: new Date(new Date().getTime() + time * 1000),
        },
        ["channelId", "userId"]
      );
      const systemMessage: string = `${muted.user.nickname} has been muted for ${time} seconds by ${muter.user.nickname}`;
      await this.sendSystemMsg(mutedId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async ban(
    bannerId: number,
    channelId: number,
    bannedId: number,
    client: Socket
  ): Promise<void> {
    const banner: ChannelUser = await this.findUser(channelId, bannerId);
    const banned: ChannelUser = await this.findUser(channelId, bannedId);
    if (
      !banner.isAdmin ||
      banned.isOwner ||
      (!banner.isOwner && banned.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ChannelUser, { channelId, bannedId });
      await queryRunner.manager.insert(Ban, { channelId, userId: bannedId });
      const systemMessage: string = `${banned.user.nickname} has been banned by ${banner.user.nickname}`;
      await this.sendSystemMsg(bannedId, channelId, systemMessage, client);
      if (banned.user.status === "online") {
        const bannedSocket = await client
          .to(banned.user.socketId)
          .fetchSockets();
        bannedSocket[0].leave("c" + channelId);
        bannedSocket[0].emit("banned-channel", { id: channelId });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unban(
    unbannerId: number,
    channelId: number,
    unbannedId: number
  ): Promise<void> {
    const unbanner: ChannelUser = await this.findUser(channelId, unbannerId);
    if (!unbanner.isAdmin) {
      throw new WsException("permission denied");
    }
    await this.banService.delete(channelId, unbannedId);
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
    client: Socket
  ): Promise<void> {
    const sockets = await client.in("c" + channelId).fetchSockets();
    const channelUsers: ChannelUser[] = await this.findUsers(channelId);
    const notJoined: ChannelUser[] = channelUsers.filter(
      (channelUser) =>
        !sockets.some((socket) => socket.id === channelUser.user.socketId)
    );
    const onlineSockets: string[] = channelUsers
      .filter((channelUser) => channelUser.user.status === "online")
      .map((onlineChannelUser) => onlineChannelUser.user.socketId);
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
          isSystem: false,
        }
      );
      await queryRunner.manager.increment(
        ChannelUser,
        notJoined,
        "newMsgCount",
        1
      );
      await queryRunner.commitTransaction();

      const chat: ChannelChat = await this.findChat(newChat.identifiers[0].id);
      client.to(onlineSockets).emit("send-channel", new ChatResponse(chat));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sendSystemMsg(
    userId: number,
    channelId: number,
    message: string,
    client: Socket
  ): Promise<void> {
    const sockets = await client.in("c" + channelId).fetchSockets();
    const channelUsers: ChannelUser[] = await this.findUsers(channelId);
    const notJoined: ChannelUser[] = channelUsers.filter(
      (channelUser) =>
        !sockets.some((socket) => socket.id === channelUser.user.socketId)
    );
    const onlineSockets: string[] = channelUsers
      .filter((channelUser) => channelUser.user.status === "online")
      .map((onlineChannelUser) => onlineChannelUser.user.socketId);
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
          isSystem: true,
        }
      );
      await queryRunner.manager.increment(
        ChannelUser,
        notJoined,
        "newMsgCount",
        1
      );
      await queryRunner.commitTransaction();

      const chat: ChannelChat = await this.findChat(newChat.identifiers[0].id);
      client
        .to(onlineSockets)
        .emit("send-channel-system", new ChatResponse(chat));
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
    client.leave("c" + channelId);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const primaryKey = { channelId, userId };
      const systemMessage: string = `${channelUser.user.nickname} has left`;
      await queryRunner.manager.delete(ChannelUser, primaryKey);
      await this.sendSystemMsg(userId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(userId: number, channelId: number, password: string) {
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
    channelId: number,
    newOwnerId: number,
    client: Socket
  ): Promise<void> {
    const oldOwner: ChannelUser = await this.findUser(channelId, userId);
    if (!oldOwner.isOwner) {
      throw new WsException("permission denied");
    }
    const newOwner: ChannelUser = await this.findUser(channelId, newOwnerId);
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
      const systemMessage: string = `The owner of the channel has been changed from ${oldOwner.user.nickname} to ${newOwner.user.nickname}.
      `;
      await this.sendSystemMsg(newOwnerId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addAdmin(
    userId: number,
    channelId: number,
    newAdminId: number,
    client: Socket
  ): Promise<void> {
    const owner: ChannelUser = await this.findUser(channelId, userId);
    if (!owner.isOwner) {
      throw new WsException("permission denied");
    }
    const newAdmin: ChannelUser = await this.findUser(channelId, newAdminId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        ChannelUser,
        { channelId, userId: newAdminId },
        {
          isAdmin: true,
        }
      );
      const systemMessage: string = `${newAdmin.user.nickname} has been granted the "admin" role.
      `;
      await this.sendSystemMsg(newAdminId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAdmin(
    userId: number,
    channelId: number,
    targetId: number,
    client: Socket
  ): Promise<void> {
    const owner: ChannelUser = await this.findUser(channelId, userId);
    const target: ChannelUser = await this.findUser(channelId, targetId);
    if (!owner.isOwner || target.isOwner) {
      throw new WsException("permission denied");
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        ChannelUser,
        { channelId, userId: targetId },
        {
          isAdmin: false,
        }
      );
      const systemMessage: string = `${target.user.nickname} has been revoked the "admin" role.
      `;
      await this.sendSystemMsg(targetId, channelId, systemMessage, client);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findChat(id: number): Promise<ChannelChat> {
    return await this.chatRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        id,
      },
    });
  }
}
