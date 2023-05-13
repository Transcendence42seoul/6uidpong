import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { DataSource } from "typeorm";

@Injectable()
export class DisconnectionService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async updateUserInfo(socketId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.userService.updateStatus(socketId, "offline");
      await this.userService.updateSocketId(socketId, "");

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
