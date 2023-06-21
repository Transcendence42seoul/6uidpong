import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";
import { ChannelChat } from "src/chat/entity/channel/chat.entity";

@Injectable()
export class ChannelChatService {
  constructor(
    @InjectRepository(ChannelChat)
    private readonly chatRepository: Repository<ChannelChat>
  ) {}

  async find(channelId: number, createdAt: Date): Promise<ChannelChat[]> {
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

  async findOneOrFail(id: number): Promise<ChannelChat> {
    return await this.chatRepository.findOneOrFail({
      relations: {
        user: true,
      },
      where: {
        id,
      },
    });
  }
}
