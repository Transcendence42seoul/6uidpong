import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { Friend } from "src/user/entity/friend.entity";
import { DataSource, Repository } from "typeorm";
import { Block } from "../../entity/dm/block.entity";

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly dataSource: DataSource
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

  async block(userId: number, interlocutorId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(Block, {
        userId: userId,
        blockedUserId: interlocutorId,
      });
      await queryRunner.manager.delete(Friend, [
        {
          userId,
          friendId: interlocutorId,
        },
        {
          userId: interlocutorId,
          friendId: userId,
        },
      ]);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
