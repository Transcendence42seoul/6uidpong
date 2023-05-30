import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { Repository } from "typeorm";
import { Block } from "../../entity/dm/block.entity";

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>
  ) {}

  async find(userId: number): Promise<Block[]> {
    return await this.blockRepository.find({
      relations: {
        blockedUser: true,
      },
      where: {
        userId,
      },
      order: {
        blockedUser: {
          nickname: "ASC",
        },
      },
    });
  }

  async insert(userId: number, interlocutorId: number): Promise<void> {
    await this.blockRepository.insert({
      userId: userId,
      blockedUserId: interlocutorId,
    });
  }

  async delete(userId: number, interlocutorId: number): Promise<void> {
    await this.blockRepository.delete({
      userId: userId,
      blockedUserId: interlocutorId,
    });
  }

  async has(userId: number, interlocutorId: number): Promise<boolean> {
    if (
      await this.blockRepository.countBy([
        {
          userId: interlocutorId,
          blockedUserId: userId,
        },
        {
          userId,
          blockedUserId: interlocutorId,
        },
      ])
    ) {
      return true;
    }
    return false;
  }
}
