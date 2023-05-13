import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { DataSource } from "typeorm";

@Injectable()
export class ConnectionService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async updateUserInfo(userId: number, socketId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.userService.updateStatus(userId, "online");
      await this.userService.updateSocketId(userId, socketId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
