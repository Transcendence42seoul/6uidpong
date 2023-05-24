import { Injectable } from "@nestjs/common";
import { User } from "src/user/entity/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class ConnectionService {
  constructor(private readonly dataSource: DataSource) {}

  async updateUserInfo(userId: number, socketId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(User, userId, {
        status: "online",
      });
      await queryRunner.manager.update(User, userId, {
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
