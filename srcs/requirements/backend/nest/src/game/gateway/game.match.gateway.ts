import { UseGuards } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { GameMatchService } from "../service/game.match.service";

@WebSocketGateway(80, {
  namespace: "game",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class GameMatchGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly gameMatchService: GameMatchService) {}

  @SubscribeMessage("create-custom-room")
  createCustomGame(
    client: Socket,
    @MessageBody("roomInfo")
    roomInfo: {
      title: string;
      password: string | null;
      mode: boolean;
    }
  ): void {
    this.gameMatchService.createCustomGame(client, roomInfo);
  }

  @SubscribeMessage("join-custom-room")
  joinCustomGame(
    client: Socket,
    @MessageBody("roomInfo")
    roomInfo: {
      roomId: number;
      password: string | null;
    }
  ): void {
    this.gameMatchService.joinCustomGame(client, roomInfo);
  }

  @SubscribeMessage("start-custom-room")
  startCustomGame(client: Socket, @MessageBody("roomId") roomId: number): void {
    this.gameMatchService.customGameStart(client, roomId);
  }

  @SubscribeMessage("exit-custom-room")
  exitCustomGame(client: Socket, @MessageBody("roomId") roomId: number): void {
    this.gameMatchService.exitCustomGame(client, roomId);
  }

  @SubscribeMessage("custom-room-list")
  getCustomGameList(client: Socket): void {
    this.gameMatchService.getCustomGameList(client);
  }

  @SubscribeMessage("ladder-game-match")
  handleConnectLadder(client: Socket): void {
    this.gameMatchService.handleLadderMatchStart(client);
  }

  @SubscribeMessage("ladder-game-match-cancel")
  handleDisconnectLadder(client: Socket): void {
    this.gameMatchService.handleLadderMatchcancel(client);
  }
}
