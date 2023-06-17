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

  @SubscribeMessage("keyState")
  handleKeyState(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    keyInfo: {
      roomId: number;
      message: string;
    }
  ): void {
    this.gameRoomService.handleKeyState(client, keyInfo);
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
    try {
      const smallRoomInfo = roomInfo;
      await this.gameRoomService.handleGameLeave(client, smallRoomInfo);
    } catch {}
  }
}
