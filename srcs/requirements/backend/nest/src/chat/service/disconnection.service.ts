import { Injectable } from "@nestjs/common";
import { User } from "src/user/entity/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class DisconnectionService {
  constructor(private readonly dataSource: DataSource) {}

  async updateUserInfo(socketId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findOptions: Object = { socketId: socketId };
      await queryRunner.manager.update(User, findOptions, {
        status: "offline",
      });
      await queryRunner.manager.update(User, findOptions, {
        socketId: "",
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
