import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { FriendResponseDto } from "../dto/friend-response.dto";
import { FriendRequestEntity } from "../entity/friend-request.entity";
import { FriendEntity } from "../entity/friend.entity";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
    private readonly dataSource: DataSource
  ) {}

  async find(userId: number): Promise<FriendResponseDto[]> {
    return await this.friendRepository
      .createQueryBuilder("friends")
      .select([
        "users.id       AS id",
        "users.nickname AS nickname",
        "users.image    AS image",
        "users.status   AS status",
      ])
      .innerJoin(
        UserEntity,
        "users",
        "users.id = CASE WHEN friends.from_id = :userId THEN friends.to_id ELSE friends.from_id END",
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
      queryRunner.manager.findOneByOrFail(FriendRequestEntity, {
        fromId: friendId,
        toId: userId,
      });
      queryRunner.manager.delete(FriendRequestEntity, {
        fromId: friendId,
        toId: userId,
      });
      queryRunner.manager.save(
        FriendEntity,
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
    const result: FriendEntity = await this.friendRepository.findOneByOrFail([
      { fromId: userId, toId: friendId },
      { fromId: friendId, toId: userId },
    ]);
    await this.friendRepository.remove(result);
  }
}
