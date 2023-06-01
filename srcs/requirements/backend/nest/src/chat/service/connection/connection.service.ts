import { Injectable } from "@nestjs/common";
import { Namespace } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DataSource } from "typeorm";

@Injectable()
export class ConnectionService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async connect(
    userId: number,
    socketId: string,
    server: Namespace
  ): Promise<void> {
    const user: User = await this.userService.findOne(userId);
    if (user.socketId !== "") {
      server.in(user.socketId).disconnectSockets(true);
    }
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

  async disconnect(socketId: string): Promise<void> {
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
