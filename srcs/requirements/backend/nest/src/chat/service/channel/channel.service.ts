import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AllChannelResponseDto } from "src/chat/dto/channel/all-channel-response.dto";
import { MyChannelResponseDto } from "src/chat/dto/channel/my-channel-response.dto";
import { ChannelUserEntity } from "src/chat/entity/channel/channel-user.entity";
import { ChannelEntity } from "src/chat/entity/channel/channel.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepository: Repository<ChannelEntity>,
    @InjectRepository(ChannelUserEntity)
    private readonly channelUserRepository: Repository<ChannelUserEntity>
  ) {}

  async findAll(): Promise<AllChannelResponseDto[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'channel.is_public            AS "isPublic"',
        'count(*)                     AS "memberCount"',
      ])
      .innerJoin("channel.channelUsers", "channel_users")
      .groupBy("channel.id")
      .addGroupBy("channel.title")
      .addGroupBy("channel.is_public")
      .orderBy("channel.title", "ASC")
      .getRawMany();
  }

  async find(userId: number): Promise<MyChannelResponseDto[]> {
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
        (memberCountSubQuery) =>
          memberCountSubQuery
            .select(["sub.channel_id", "count(*) AS count"])
            .from(ChannelUserEntity, "sub")
            .groupBy("sub.channel_id"),
        "member_count",
        "channel_users.channel_id = member_count.channel_id"
      )
      .where("channel_users.user_id = :userId", { userId })
      .orderBy("channel.title", "ASC")
      .getRawMany();
  }
}
