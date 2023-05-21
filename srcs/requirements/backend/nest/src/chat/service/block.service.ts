import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockEntity } from "../entity/block-list.entity";

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>
  ) {}

  async create(userId: number, interlocutorId: number): Promise<void> {
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
