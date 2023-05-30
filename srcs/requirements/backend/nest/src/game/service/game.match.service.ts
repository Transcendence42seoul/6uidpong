import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { inviteRoomDto } from "../dto/game.dto";
import { GameRoomService } from "./game.room.service";

@Injectable()
export class GameMatchService {
  private queue: Socket[] = [];
  private rooms: inviteRoomDto[] = [];

  constructor(private GameRoomService: GameRoomService) {
    setInterval(this.handleLadderMatch.bind(this), 1000);
  }

  handleLadderMatch() {
    for (let i = 1; i <= this.queue.length; i += 2) {
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
      console.log(this.queue);
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
