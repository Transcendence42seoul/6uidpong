import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { customRoomDto } from "../dto/game.dto";
import { GameRoomService } from "./game.room.service";

@Injectable()
export class GameMatchService {
  private queue: Socket[] = [];
  private rooms: customRoomDto[] = [];
  private roomNumber = 1;

  constructor(private GameRoomService: GameRoomService) {
    setInterval(this.handleLadderMatch.bind(this), 1000);
  }

  createCustomGame(
    client: Socket,
    roomInfo: { mode: boolean; password: string | null }
  ): void {
    const roomId = this.roomNumber++;
    const room: customRoomDto = {
      roomId: roomId,
      user1: client,
      user2: undefined,
      mode: roomInfo.mode,
      password: roomInfo.password,
    };
    this.rooms.push(room);
    client.emit("custom-room-created", room);
  }

  getCustomGameList(client: Socket): void {
    const room: customRoomDto[] = this.rooms;
    client.emit("custom-room-lists", room);
  }

  //destroy, exit logic
  exitCustomGame(client: Socket, roomId: number): void {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (room.user1 === client) {
        this.rooms.splice(roomIndex, 1);
        room.user1.emit("room-destroyed");
        room.user2.emit("room-destroyed");
      } else if (room.user2 === client) {
        room.user2 = undefined;
        room.user1.emit("user-exit", room);
        room.user2.emit("user-exit", room);
      }
    } else {
      console.log("Room not found");
    }
  }

  async customGameStart(client: Socket, roomId: number): Promise<void> {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      await this.GameRoomService.createRoom(room.user1, room.user2, false);
    }
  }

  joinCustomGame(client: Socket, roomId: number): void {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (room.user1 !== client && room.user2 === undefined) {
        room.user2 = client;
        room.user1.emit("user-join", room);
        room.user2.emit("user-join", room);
      } else {
        console.log("cannot join to the room");
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
    const index2 = this.rooms.findIndex((queue) => queue.user1 === client);
    if (index2 !== -1) {
      this.rooms.splice(index2, 1);
    }
  }
}
