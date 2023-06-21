import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DataSource } from "typeorm";
import { GameMatchService } from "./match.service";
import { GameRoomService } from "./room.service";

@Injectable()
export class ConnectionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly gameMatchService: GameMatchService,
    private readonly gameRoomService: GameRoomService
  ) {}

  async connect(client: Socket, server: Namespace): Promise<void> {
    const { token } = client.handshake.auth;
    if (typeof token === "undefined") {
      throw new WsException("");
    }
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
    });
    const user: User = await this.userService.findOneOrFail(payload.id);
    if (user.gameSocketId !== "") {
      this.gameMatchService.clear(user);
      server.in(user.gameSocketId).disconnectSockets(true);
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        User,
        { id: user.id },
        { gameSocketId: client.id }
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async disconnect(socketId: string): Promise<void> {
    const user: User = await this.userService.findBySocketId(socketId);
    if (!user) {
      return;
    }
    this.gameMatchService.clear(user);
    this.gameRoomService.clear(user.id);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        User,
        {
          gameSocketId: socketId,
        },
        {
          gameSocketId: "",
        }
      );
      await queryRunner.manager.update(
        User,
        {
          gameSocketId: socketId,
        },
        {
          status: "offline",
        }
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
