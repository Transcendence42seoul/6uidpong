import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AllChannelResponseDto } from "src/chat/dto/channel/all-channel-response.dto";
import { CreateChannelDto } from "src/chat/dto/channel/create-channel.dto";
import { MyChannelResponseDto } from "src/chat/dto/channel/my-channel-response.dto";
import { ChannelChatEntity } from "src/chat/entity/channel/channel-chat.entity";
import { ChannelUserEntity } from "src/chat/entity/channel/channel-user.entity";
import { ChannelEntity } from "src/chat/entity/channel/channel.entity";
import * as bcryptjs from "bcryptjs";
import { DataSource, MoreThanOrEqual, Repository } from "typeorm";

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepository: Repository<ChannelEntity>,
    @InjectRepository(ChannelUserEntity)
    private readonly channelUserRepository: Repository<ChannelUserEntity>,
    @InjectRepository(ChannelChatEntity)
    private readonly chatRepository: Repository<ChannelChatEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findAllChannels(): Promise<AllChannelResponseDto[]> {
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

  async findChannel(channelId: number): Promise<ChannelEntity> {
    return await this.channelRepository.findOneOrFail({
      where: {
        id: channelId,
      },
    });
  }

  async findMyChannels(userId: number): Promise<MyChannelResponseDto[]> {
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
            .from(ChannelUserEntity, "sub")
            .groupBy("sub.channel_id"),
        "member_count",
        "channel_users.channel_id = member_count.channel_id"
      )
      .where("channel_users.user_id = :userId")
      .orderBy("channel.title", "ASC")
      .setParameter("userId", userId)
      .getRawMany();
  }

  async findUser(
    channelId: number,
    userId: number
  ): Promise<ChannelUserEntity> {
    return await this.channelUserRepository.findOneOrFail({
      where: {
        channelId,
        userId,
      },
    });
  }

  async saveUser(
    channelId: number,
    userId: number
  ): Promise<ChannelUserEntity> {
    return await this.channelUserRepository.save({
      channelId,
      userId,
    });
  }

  async findChats(
    channelId: number,
    channelUser: ChannelUserEntity
  ): Promise<ChannelChatEntity[]> {
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

  async createChannel(userId: number, body: CreateChannelDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const saveOptions: Object = {
        transaction: false,
      };
      const encrypted: string = await bcryptjs.hash(
        body.password,
        await bcryptjs.genSalt()
      );

      const newChannel: ChannelEntity = await queryRunner.manager.save(
        ChannelEntity,
        {
          title: body.title,
          isPublic: body.isPublic,
          password: encrypted,
        },
        saveOptions
      );
      await queryRunner.manager.save(
        ChannelUserEntity,
        {
          channelId: newChannel.id,
          userId,
          isOwner: true,
          isAdmin: true,
        },
        saveOptions
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
