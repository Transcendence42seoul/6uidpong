import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelResponse } from "src/chat/dto/channel/channel-response";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { Channel } from "src/chat/entity/channel/channel.entity";
import * as bcryptjs from "bcryptjs";
import { Repository } from "typeorm";

@Injectable()
export class ChannelRoomService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) {}

  async findAll(): Promise<ChannelResponse[]> {
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
      .innerJoin("channel.channelUsers", "channel_users")
      .where("channel.is_public = true")
      .groupBy("channel.id")
      .addGroupBy("channel.title")
      .addGroupBy("channel.password")
      .orderBy("channel.title", "ASC")
      .getRawMany();
  }

  async find(userId: number): Promise<ChannelResponse[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'channel.is_public            AS "isPublic"',
        'channel_users.new_msg_count  AS "newMsgCount"',
        'member_count.count           AS "memberCount"',
      ])
      .innerJoin("channel.channelUsers", "channel_users")
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

  async findOne(channelId: number): Promise<Channel> {
    return await this.channelRepository.findOneOrFail({
      where: {
        id: channelId,
      },
    });
  }

  async delete(channelId: number): Promise<void> {
    await this.channelRepository.delete(channelId);
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.channelRepository.update(id, {
      password:
        typeof password === "undefined"
          ? ""
          : await bcryptjs.hash(password, await bcryptjs.genSalt()),
    });
  }
}
