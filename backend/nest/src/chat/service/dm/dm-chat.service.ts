import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DmChat } from "src/chat/entity/dm/dm-chat.entity";
import { MoreThanOrEqual, Repository } from "typeorm";

@Injectable()
export class DmChatService {
  constructor(
    @InjectRepository(DmChat)
    private readonly chatRepository: Repository<DmChat>
  ) {}

  async find(roomId: number, userCreatedAt: Date): Promise<DmChat[]> {
    return await this.chatRepository.find({
      relations: {
        user: true,
      },
      where: {
        room: {
          id: roomId,
        },
        createdAt: MoreThanOrEqual(userCreatedAt),
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

  async findOneOrFail(id: number): Promise<DmChat> {
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
