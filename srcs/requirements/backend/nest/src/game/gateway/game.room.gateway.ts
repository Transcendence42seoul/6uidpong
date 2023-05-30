import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "http";
import { Socket } from "socket.io";
import { keyCode } from "../dto/game.dto";
import { GameRoomService } from "../service/game.room.service";

@WebSocketGateway(80, {
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
export class GameRoomGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gameRoomService: GameRoomService) {}

  @SubscribeMessage("keyup")
  keyup(client: Socket, payload: keyCode): void {
    this.gameRoomService.handleKeyState(client, payload, 1);
  }

  @SubscribeMessage("keydown")
  keydown(client: Socket, payload: keyCode): void {
    this.gameRoomService.handleKeyState(client, payload, -1);
  }
}
