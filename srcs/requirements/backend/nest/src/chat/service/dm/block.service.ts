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

  async save(userId: number, interlocutorId: number): Promise<void> {
    await this.blockRepository.save({
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

  async isBlocked(userId: number, interlocutorId: number): Promise<boolean> {
    return (await this.blockRepository.countBy({
      userId: userId,
      blockedUserId: interlocutorId,
    }))
      ? true
      : false;
  }
}
