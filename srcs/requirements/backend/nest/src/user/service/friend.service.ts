import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { FriendRequest } from "../entity/friend-request.entity";
import { Friend } from "../entity/friend.entity";

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    private readonly dataSource: DataSource
  ) {}

  async find(userId: number): Promise<Friend[]> {
    return await this.friendRepository.find({
      relations: {
        friend: true,
      },
      where: {
        userId,
      },
      order: {
        friend: {
          nickname: "ASC",
        },
      },
    });
  }

  async findOneOrFail(userId: number, friendId: number): Promise<Friend> {
    return await this.friendRepository.findOneOrFail({
      where: {
        userId,
        friendId,
      },
    });
  }

  async save(userId: number, friendId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.findOneByOrFail(FriendRequest, {
        fromId: friendId,
        toId: userId,
      });
      queryRunner.manager.delete(FriendRequest, [
        {
          fromId: friendId,
          toId: userId,
        },
        {
          fromId: userId,
          toId: friendId,
        },
      ]);
      queryRunner.manager.insert(Friend, [
        {
          userId,
          friendId,
        },
        {
          userId: friendId,
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

  async delete(userId: number, friendId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Friend, { userId, friendId });
      await queryRunner.manager.delete(Friend, {
        userId: friendId,
        friendId: userId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
