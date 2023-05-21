import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { channel } from "diagnostics_channel";
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

  async findAll(): Promise<ChannelEntity[]> {
    return await this.channelRepository.find({
      select: {
        id: true,
        title: true,
        isPublic: true,
      },
      order: {
        title: "ASC",
      },
    });
  }

  async find(userId: number): Promise<ChannelUserEntity[]> {
    return await this.channelUserRepository
      .createQueryBuilder("channel_users")
      .select([
        "channel.id",
        "channel.title",
        "channel.is_public",
        "channel_users.new_msg_count",
      ])
      .leftJoinAndSelect("channel_users.channel", "channel")
      .where("channel_users.user_id = :userId", { userId })
      .orderBy("channel.title", "ASC")
      .getMany();
  }
}
