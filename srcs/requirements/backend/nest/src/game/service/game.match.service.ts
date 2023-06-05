import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { UserService } from "src/user/service/user.service";
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
      mode: boolean;
    }
  ): Promise<void> {
    const roomId = this.roomNumber++;
    const master = await this.userService.findBySocketId(client.id);
    const room: customRoomInfo = {
      roomId: roomId,
      isLocked: !!roomInfo.password,
      ...roomInfo,
      master: master,
      participant: undefined,
    };
    this.rooms.push(room);
    const roomPassword: customRoomPassword = {
      roomId: roomId,
      master: client,
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
        room.participant = undefined;
        room.isLocked = false;
        this.roomPassword[roomIndex].master.emit("user-exit", room);
        client.emit("user-exit", room);
      }
    } else {
      console.log("Room not found");
    }
  }

  async customGameStart(client: Socket, roomId: number): Promise<void> {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      await this.GameRoomService.createRoom(
        this.roomPassword[roomIndex].master,
        client,
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
    const participant = await this.userService.findBySocketId(client.id);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (this.roomPassword[roomIndex].password === roomInfo.password) {
        if (room.isLocked === false) {
          room.participant = participant;
          room.isLocked = true;
          this.roomPassword[roomIndex].master.emit("user-join", room);
          client.emit("user-join", room);
        }
      } else {
        client.emit("wrong-password");
      }
    }
  }

  handleLadderMatch() {
    const length = this.queue.length;
    for (let i = 1; i < length; i += 2) {
      const player1 = this.queue[0];
      const player2 = this.queue[1];
      this.GameRoomService.createRoom(player1, player2, true);
      console.log("game room created");
      this.queue.splice(0, 2);
    }
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
