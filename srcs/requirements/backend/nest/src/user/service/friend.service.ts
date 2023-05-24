import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { FriendResponse } from "../dto/friend-response.dto";
import { FriendRequest } from "../entity/friend-request.entity";
import { Friend } from "../entity/friend.entity";
import { User } from "../entity/user.entity";

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    private readonly dataSource: DataSource
  ) {}

  async find(userId: number): Promise<FriendResponse[]> {
    return await this.friendRepository
      .createQueryBuilder("friends")
      .select([
        "users.id       AS id",
        "users.nickname AS nickname",
        "users.image    AS image",
        "users.status   AS status",
      ])
      .innerJoin(
        User,
        "users",
        "users.id = CASE WHEN friends.from_id = :userId THEN friends.to_id \
                         WHEN friends.to_id = :userId THEN friends.from_id \
                         END",
        { userId }
      )
      .orderBy("users.nickname", "ASC")
      .getRawMany();
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
      queryRunner.manager.delete(FriendRequest, {
        fromId: friendId,
        toId: userId,
      });
      queryRunner.manager.save(
        Friend,
        {
          fromId: friendId,
          toId: userId,
        },
        { transaction: false }
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(userId: number, friendId: number): Promise<void> {
    const friend: Friend = await this.friendRepository.findOneByOrFail([
      { fromId: userId, toId: friendId },
      { fromId: friendId, toId: userId },
    ]);
    await this.friendRepository.remove(friend);
  }
}
