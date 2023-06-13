import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MyChannelResponse } from "src/chat/dto/channel/my-channel-response";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { Channel } from "src/chat/entity/channel/channel.entity";
import * as bcryptjs from "bcryptjs";
import { Repository } from "typeorm";
import { AllChannelResponse } from "src/chat/dto/channel/all-channel-response";

@Injectable()
export class ChannelRoomService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) {}

  async findAll(userId: number): Promise<AllChannelResponse[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'member_count.count           AS "memberCount"',
        "CASE WHEN channel.password = '' THEN false \
              ELSE true                             \
              END                     AS \"isLocked\"",
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select("CASE WHEN count(*) = 0 THEN false ELSE true END")
            .from(ChannelUser, "sub")
            .where("sub.channel_id = channel.id")
            .andWhere("sub.user_id = :userId", { userId }),
        "isJoined"
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select(["sub.channel_id", "count(*) AS count"])
            .from(ChannelUser, "sub")
            .groupBy("sub.channel_id"),
        "member_count",
        "channel.id = member_count.channel_id"
      )
      .where("channel.is_public = true")
      .orderBy('"isJoined"', "ASC")
      .addOrderBy("channel.title", "ASC")
      .getRawMany();
  }

  async find(userId: number): Promise<MyChannelResponse[]> {
    return await this.channelRepository
      .createQueryBuilder("channel")
      .select([
        "channel.id                   AS id",
        "channel.title                AS title",
        'channel.is_public            AS "isPublic"',
        'channel_users.new_msg_count  AS "newMsgCount"',
        'channel_users.is_owner       AS "isOwner"',
        'channel_users.is_admin       AS "isAdmin"',
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

  async findOneOrFail(channelId: number): Promise<Channel> {
    return await this.channelRepository.findOneOrFail({
      where: {
        id: channelId,
      },
    });
  }

  async findOneByTitle(title: string): Promise<Channel> {
    return await this.channelRepository.findOneBy({ title });
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
