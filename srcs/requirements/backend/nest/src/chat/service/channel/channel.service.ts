import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelCreateRequest } from "src/chat/dto/channel/channel-create-request.dto";
import { ChannelResponse } from "src/chat/dto/channel/channel-response.dto";
import { ChannelChat } from "src/chat/entity/channel/channel-chat.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { Channel } from "src/chat/entity/channel/channel.entity";
import * as bcryptjs from "bcryptjs";
import { DataSource, MoreThanOrEqual, Repository, InsertResult } from "typeorm";
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
    @InjectRepository(Mute)
    private readonly muteRepository: Repository<Mute>,
    private readonly dataSource: DataSource
  ) {}

  async findAllChannels(): Promise<ChannelResponse[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'count(*)                     AS "memberCount"',
        'CASE WHEN channel.password IS NOT NULL THEN true \
              ELSE false                                  \
              END                     AS "isLocked"',
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

  async findUserOrFail(
    channelId: number,
    userId: number
  ): Promise<ChannelUser> {
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

  async insertUsers(
    channelId: number,
    userIds: number[]
  ): Promise<ChannelUser[]> {
    const info: Object[] = userIds.map((userId) => ({ channelId, userId }));
    await this.channelUserRepository.insert(info);
    return await this.channelUserRepository.findBy(info);
  }

  async findChats(
    channelId: number,
    channelUser: ChannelUser
  ): Promise<ChannelChat[]> {
    return await this.chatRepository.find({
      relations: {
        user: true,
      },
      where: {
        channel: {
          id: channelId,
        },
        createdAt: MoreThanOrEqual(channelUser.createdAt),
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

  async createChannel(
    userId: number,
    body: ChannelCreateRequest
  ): Promise<Channel> {
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
            typeof body.password === undefined
              ? null
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

  async insertChat(
    userId: number,
    channelId: number,
    message: string,
    notJoinedUsers: ChannelUser[]
  ): Promise<ChannelChat> {
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
        notJoinedUsers,
        "newMsgCount",
        1
      );

      await queryRunner.commitTransaction();

      return await this.chatRepository.findOneBy({
        id: newChat.identifiers[0].id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteChannel(id: number): Promise<void> {
    await this.channelRepository.delete(id);
  }

  async deleteUser(channelId: number, userId: number): Promise<void> {
    await this.channelUserRepository.delete({ channelId, userId });
  }

  async updatePassword(channelId: number, password: string | undefined) {
    await this.channelRepository.update(channelId, {
      password:
        typeof password === undefined
          ? null
          : await bcryptjs.hash(password, await bcryptjs.genSalt()),
    });
  }

  async transferOwnership(
    channelId: number,
    oldOwner: number,
    newOwner: number
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.update(
        ChannelUser,
        { channelId, userId: newOwner },
        {
          isOwner: true,
          isAdmin: true,
        }
      );
      queryRunner.manager.update(
        ChannelUser,
        { channelId, userId: oldOwner },
        {
          isOwner: false,
          isAdmin: false,
        }
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateIsAdmin(
    channelId: number,
    userId: number,
    value: boolean
  ): Promise<void> {
    await this.channelUserRepository.update(
      { channelId, userId },
      {
        isAdmin: value,
      }
    );
  }
}
