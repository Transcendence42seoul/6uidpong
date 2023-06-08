import { Injectable } from "@nestjs/common";
import { timeStamp } from "console";
import { Namespace, Socket } from "socket.io";
import { UserService } from "src/user/service/user.service";
import { ServerType } from "typeorm";
import { customRoomInfo, customRoomPassword } from "../dto/game.dto";
import { GameRoomService } from "./game.room.service";

@Injectable()
export class GameMatchService {
  private queue: Socket[] = [];
  private rooms: customRoomInfo[] = [];
  private roomPassword: customRoomPassword[] = [];
  private roomNumber = 1;

  constructor(
    private GameRoomService: GameRoomService,
    private userService: UserService
  ) {
    setInterval(this.handleLadderMatch.bind(this), 1000);
  }

  async createCustomGame(
    client: Socket,
    roomInfo: {
      title: string;
      password: string | null;
    }
  ): Promise<void> {
    const roomId = this.roomNumber++;
    const { id: masterId } = await this.userService.findBySocketId(client.id);
    const room: customRoomInfo = {
      roomId,
      title: roomInfo.title,
      isLocked: !!roomInfo.password,
      masterId,
      participantId: undefined,
    };
    this.rooms.push(room);
    const roomPassword: customRoomPassword = {
      roomId,
      master: client,
      participant: null,
      password: roomInfo.password,
    };
    this.roomPassword.push(roomPassword);
    client.emit("custom-room-created", roomId);
  }

  getCustomGameList(client: Socket): void {
    const room: customRoomInfo[] = this.rooms;
    client.emit("custom-room-list", room);
  }

  //destroy, exit logic
  exitCustomGame(client: Socket, roomId: number): void {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (this.roomPassword[roomIndex].master === client) {
        this.rooms.splice(roomIndex, 1);
        this.roomPassword[roomIndex].master.emit("room-destroyed");
        client.emit("room-destroyed");
      } else {
        room.participantId = undefined;
        room.isLocked = false;
        this.roomPassword[roomIndex].master.emit("user-exit", room);
        client.emit("user-exit", room);
      }
    } else {
      console.log("Room not found");
    }
  }

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
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      await this.GameRoomService.createRoom(
        this.roomPassword[roomIndex].master,
        client,
        roomInfo.mode,
        false
      );
    }
  }

  async joinCustomGame(
    client: Socket,
    roomInfo: {
      roomId: number;
      password: string | null;
    }
  ): Promise<void> {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomId === roomInfo.roomId
    );
    const { id: participantId } = await this.userService.findBySocketId(
      client.id
    );
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (room.participantId !== undefined) {
        client.emit("room-full", roomInfo.roomId);
      } else if (
        room.isLocked === true &&
        this.roomPassword[roomIndex].password === roomInfo.password
      ) {
        room.participantId = participantId;
        room.isLocked = true;
        this.roomPassword[roomIndex].master.emit("user-join", room);
        client.emit("user-join", room);
      } else {
        client.emit("wrong-password", roomInfo.roomId);
      }
    }
  }

  handleLadderMatch() {
    const length = this.queue.length;
    for (let i = 1; i < length; i += 2) {
      const player1 = this.queue[0];
      const player2 = this.queue[1];
      this.GameRoomService.createRoom(player1, player2, false, true);
      this.queue.splice(0, 2);
    }
  }

  async handleInviteGame(
    client: Socket,
    opponent: number,
    server: Namespace
  ): Promise<void> {
    const user = await this.userService.findOne(opponent);
    const master = await this.userService.findBySocketId(client.id);
    const roomId = this.roomNumber++;
    const room: customRoomInfo = {
      roomId,
      title: user.nickname + "'s game",
      isLocked: true,
      masterId: user.id,
      participantId: undefined,
    };
    this.rooms.push(room);
    const roomPassword: customRoomPassword = {
      roomId,
      master: client,
      participant: null,
      password: "Zxcasdqwe12#",
    };
    this.roomPassword.push(roomPassword);
    server
      .to(user.socketId)
      .emit("invited-user", { nickname: master.nickname, roomId });
    client.emit("invite-room-created", roomId);
  }

  async handleInviteFail(client: Socket, roomId: number, server: Namespace) {
    const user = await this.userService.findOne(this.rooms[roomId].masterId);
    const participant = await this.userService.findBySocketId(client.id);
    this.rooms.splice(roomId, 1);
    this.roomPassword.splice(roomId, 1);
    server.to(user.socketId).emit("invite-dismissed", participant.nickname);
  }

  handleLadderMatchStart(client: Socket): void {
    if (this.queue.find((queue) => queue === client) === undefined) {
      this.queue.push(client);
      console.log("user pushed into the queue");
    }
  }

  handleLadderMatchcancel(client: Socket): void {
    const index = this.queue.findIndex((queue) => queue === client);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }
}
