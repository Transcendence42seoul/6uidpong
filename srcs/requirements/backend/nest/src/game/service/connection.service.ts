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
    if (user.gameSocketId !== "") {
      server.in(user.gameSocketId).disconnectSockets(true);
    }
    await this.userService.updateGameSocket(user.id, client.id);
  }

  async disconnect(socketId: string): Promise<void> {
    const user: User = await this.userService.findBySocketId(socketId);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        User,
        {
          id: user.id,
        },
        {
          gameSocketId: "",
        }
      );
      if (user.status === "game") {
        await queryRunner.manager.update(
          User,
          {
            id: user.id,
          },
          {
            status: "offline",
          }
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
