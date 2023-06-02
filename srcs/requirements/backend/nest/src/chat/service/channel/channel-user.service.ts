import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";

@Injectable()
export class ChannelUserService {
  constructor(
    @InjectRepository(ChannelUser)
    private readonly channelUserRepository: Repository<ChannelUser>
  ) {}

  async find(channelId: number): Promise<ChannelUser[]> {
    return this.channelUserRepository.find({
      relations: {
        user: true,
      },
      where: {
        channelId,
      },
      order: {
        isOwner: "DESC",
        isAdmin: "DESC",
        createdAt: "ASC",
        user: {
          nickname: "ASC",
        },
      },
    });
  }

  async findAdmins(channelId: number): Promise<ChannelUser[]> {
    return this.channelUserRepository.find({
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

  async findOne(channelId: number, userId: number): Promise<ChannelUser> {
    return this.channelUserRepository.findOneOrFail({
      relations: {
        user: true,
      },
      where: {
        channelId,
        userId,
      },
    });
  }
}
