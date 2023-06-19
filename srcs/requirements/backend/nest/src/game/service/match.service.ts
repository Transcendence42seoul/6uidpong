import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Namespace, Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { Repository } from "typeorm";
import {
  customRoomInfo,
  GameResultResponse,
  roomSecret,
} from "../dto/game.dto";
import { GameResult } from "../entity/game.entity";
import { GameRoomService } from "./room.service";

@Injectable()
export class GameMatchService {
  private queue: Map<number, Socket> = new Map();
  private rooms: customRoomInfo[] = [];
  private roomSecrets: roomSecret[] = [];
  private roomNumber = 1;

  constructor(
    private GameRoomService: GameRoomService,
    private userService: UserService,
    @InjectRepository(GameResult)
    private gameResultRepository: Repository<GameResult>
  ) {
    setInterval(this.handleLadderMatch.bind(this), 1000);
  }

  // 프론트에서 받아서 메세지 띄워줘야함.
  async handleInviteCheck(
    master: User,
    participant: User,
    server: Namespace
  ): Promise<boolean> {
    if (participant.status === "game") {
      server.to(master.gameSocketId).emit("participant-already-ingame");
      return true;
    } else {
      for (let i = 0; i < this.rooms.length; i++) {
        if (
          this.rooms[i].masterId === master.id ||
          this.rooms[i].participantId === participant.id
        ) {
          server
            .to(master.gameSocketId)
            .emit("participant-already-in-game-room");
          return true;
        }
      }
    }
    return false;
  }

  async handleInviteGame(
    userId: number,
    client: Socket,
    opponent: number,
    server: Namespace
  ): Promise<void> {
    const master: User = await this.userService.findOne(userId);
    const participant: User = await this.userService.findOne(opponent);
    if (await this.handleInviteCheck(master, participant, server)) {
      return;
    }
    const roomId = this.roomNumber++;
    const room: customRoomInfo = {
      roomId,
      title: `${master.nickname}'s game`,
      isLocked: false,
      isPrivate: true,
      masterId: master.id,
      participantId: undefined,
    };
    this.rooms.push(room);
    const roomSecret: roomSecret = {
      roomId,
      master: [userId, client],
      participant: [undefined, undefined],
      password: null,
    };
    this.roomSecrets.push(roomSecret);
    server.to(participant.gameSocketId).emit("invited-user", {
      master: master.nickname,
      roomId,
    });
    this.roomSecrets.push(roomSecret);
    client.emit("invited-room-crated", room);
  }

  async handleInviteFail(roomId: number, server: Namespace) {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    const user: User = await this.userService.findOneOrFail(
      this.rooms[roomIndex].masterId
    );
    this.rooms.splice(roomId, 1);
    this.roomSecrets.splice(roomId, 1);
    server.to(user.gameSocketId).emit("invite-dismissed");
  }

  getCustomGameList(client: Socket): void {
    const room: customRoomInfo[] = this.rooms;
    client.emit("custom-room-list", room);
  }

  async createCustomGame(
    userId: number,
    client: Socket,
    roomInfo: { title: string; password: string | null }
  ): Promise<void> {
    const roomId = this.roomNumber++;
    const { id: masterId } = await this.userService.findOne(userId);
    const room: customRoomInfo = {
      roomId,
      title: roomInfo.title,
      isLocked: !!roomInfo.password,
      isPrivate: false,
      masterId,
      participantId: undefined,
    };
    this.rooms.push(room);
    const roomSecret: roomSecret = {
      roomId,
      master: [userId, client],
      participant: [undefined, undefined],
      password: null,
    };
    this.roomSecrets.push(roomSecret);
    client.emit("custom-room-created", room);
  }

  async joinCustomGame(
    userId: number,
    client: Socket,
    roomInfo: {
      roomId: number;
      password: string | null;
    }
  ): Promise<void> {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomId === roomInfo.roomId
    );
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (room.participantId !== undefined) {
        client.emit("room-full", roomInfo.roomId);
      } else if (this.roomSecrets[roomIndex].password === roomInfo.password) {
        room.participantId = userId;
        this.roomSecrets[roomIndex].participant = [userId, client];
        this.roomSecrets[roomIndex].master[1].emit("user-join", room);
        client.emit("user-join", room);
      } else {
        client.emit("wrong-password", roomInfo.roomId);
      }
    }
  }

  async changeMode(
    roomInfo: { roomId: number; newMode: boolean },
    server: Namespace
  ): Promise<void> {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomId === roomInfo.roomId
    );
    if (roomIndex !== -1) {
      if (this.rooms[roomIndex].participantId) {
        const participant: User = await this.userService.findOne(
          this.rooms[roomIndex].participantId
        );
        server
          .to(participant.gameSocketId)
          .emit("change-mode", roomInfo.newMode);
      }
    }
  }

  async exitCustomGame(
    userId: number,
    roomId: number,
    server: Namespace
  ): Promise<void> {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (userId === room.masterId) {
        if (this.rooms[roomIndex].participantId) {
          const participant: User = await this.userService.findOne(
            this.rooms[roomIndex].participantId
          );
          server.to(participant.gameSocketId).emit("room-destroyed");
        }
        this.rooms.splice(roomIndex, 1);
        this.roomSecrets.splice(roomIndex, 1);
      } else if (userId === room.participantId) {
        this.rooms[roomIndex].participantId = undefined;
        this.roomSecrets[roomIndex].participant = undefined;
        this.roomSecrets[roomIndex].master[1].emit(
          "user-exit",
          this.rooms[roomIndex]
        );
      }
    }
  }

  // user is not full에 대한 소켓 메시지 전송 필요
  async customGameStart(
    client: Socket,
    roomInfo: {
      roomId: number;
      mode: boolean;
    }
  ): Promise<void> {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomId === roomInfo.roomId
    );
    if (!this.rooms[roomIndex].participantId) {
      client.emit("user-is-not-full", this.rooms[roomIndex].roomId);
      return;
    }
    await this.GameRoomService.createRoom(
      this.roomSecrets[roomIndex].master,
      this.roomSecrets[roomIndex].participant,
      roomInfo.mode,
      false
    );
    this.rooms.splice(roomIndex, 1);
    this.roomSecrets.splice(roomIndex, 1);
  }

  async handleLadderMatch() {
    if (this.queue.size >= 2) {
      const iterator = this.queue.entries();
      const player1 = iterator.next();
      const player2 = iterator.next();
      await this.GameRoomService.createRoom(
        player1.value,
        player2.value,
        false,
        true
      );
      this.queue.delete(player1.value[0]);
      this.queue.delete(player2.value[0]);
    }
  }

  handleLadderMatchStart(userId: number, client: Socket): void {
    this.queue.set(userId, client);
  }

  handleLadderMatchcancel(userId: number): void {
    this.queue.delete(userId);
  }

  async handleFindMatches(userId: number): Promise<GameResultResponse[]> {
    const matches: GameResult[] = await this.gameResultRepository.find({
      relations: {
        winner: true,
        loser: true,
      },
      where: [
        {
          winner: {
            id: userId,
          },
        },
        {
          loser: {
            id: userId,
          },
        },
      ],
      order: {
        createdAt: "DESC",
      },
    });
    return matches.map((match) => new GameResultResponse(match));
  }

  clear(user: User): void {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].masterId === user.id) {
        if (this.rooms[i].participantId) {
          this.roomSecrets[i].participant[1].emit("room-destroyed");
        }
        this.rooms.splice(i, 1);
        this.roomSecrets.splice(i, 1);
        break;
      } else if (this.rooms[i].participantId === user.id) {
        this.roomSecrets[i].master[1].emit("user-exit", this.rooms[i]);
        this.rooms[i].participantId = undefined;
        this.roomSecrets[i].participant = undefined;
        break;
      }
    }
  }
}
