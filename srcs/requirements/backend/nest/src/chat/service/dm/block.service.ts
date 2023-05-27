import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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
    return (await this.blockRepository.countBy({
      userId: userId,
      blockedUserId: interlocutorId,
    }))
      ? true
      : false;
  }
}
