import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/user/entity/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class ConnectionService {
  constructor(private readonly dataSource: DataSource) {}

  async updateUserInfo(userId: number, socketId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(UserEntity, userId, {
        status: "online",
      });
      await queryRunner.manager.update(UserEntity, userId, {
        socketId: socketId,
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
