import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { JsonWebTokenError } from "jsonwebtoken";
import { Namespace, Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DataSource } from "typeorm";

@Injectable()
export class ConnectionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async connect(client: Socket, server: Namespace): Promise<void> {
    const { token } = client.handshake.auth;
    if (typeof token === "undefined") {
      throw new WsException("");
    }
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
    });
    const user: User = await this.userService.findOne(payload.id);
    if (user.socketId !== "") {
      server.in(user.socketId).disconnectSockets(true);
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(User, user.id, {
        status: "online",
      });
      await queryRunner.manager.update(User, user.id, {
        socketId: client.id,
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
      const findOptions = { socketId: socketId };
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
