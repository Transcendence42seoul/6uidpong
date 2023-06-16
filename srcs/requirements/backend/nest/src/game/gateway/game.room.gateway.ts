import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { GameRoomService } from "../service/game.room.service";

@WebSocketGateway(80, {
  namespace: "game",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class GameRoomGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(private gameRoomService: GameRoomService) {}

  @SubscribeMessage("keyup")
  keyup(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    keyInfo: {
      roomId: number;
      code: number;
    }
  ): void {
    this.gameRoomService.handleKeyState(client, keyInfo, -1);
  }

  @SubscribeMessage("keydown")
  keydown(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    keyInfo: {
      roomId: number;
      code: number;
    }
  ): void {
    this.gameRoomService.handleKeyState(client, keyInfo, 1);
  }

  @SubscribeMessage("leave-game")
  async handleGameLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    roomInfo: {
      roomId: number;
      user1Id: number;
      user2Id: number;
    }
  ): Promise<void> {
    const smallRoomInfo = roomInfo;
    await this.gameRoomService.handleGameLeave(client, smallRoomInfo);
  }
}
