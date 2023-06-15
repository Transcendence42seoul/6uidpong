import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtPayload } from "jsonwebtoken";
import { Namespace, Socket } from "socket.io";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { WsJwtPayload } from "src/chat/utils/decorator/ws-jwt-payload.decorator";
import { GameResultResponse } from "../dto/game.dto";
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
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomInfo: {
      title: string;
      password: string | null;
    }
  ): void {
    this.gameMatchService.createCustomGame(client, roomInfo);
  }

  @SubscribeMessage("invite-game")
  handleInviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() opponent: number
  ): void {
    this.gameMatchService.handleInviteGame(client, opponent, this.server);
  }

  @SubscribeMessage("invite-success")
  handleInviteSuccess(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number
  ): void {
    const roomInfo = {
      roomId: roomId,
      password: null,
    };
    this.gameMatchService.joinCustomGame(client, roomInfo);
  }

  @SubscribeMessage("invite-failed")
  handleInviteFail(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number
  ): void {
    this.gameMatchService.handleInviteFail(client, roomId, this.server);
  }

  @SubscribeMessage("join-custom-room")
  joinCustomGame(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomInfo: {
      roomId: number;
      password: string | null;
    }
  ): void {
    this.gameMatchService.joinCustomGame(client, roomInfo);
  }

  @SubscribeMessage("start-custom-room")
  startCustomGame(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    roomInfo: {
      roomId: number;
      mode: boolean;
    }
  ): void {
    this.gameMatchService.customGameStart(client, roomInfo);
  }

  @SubscribeMessage("exit-custom-room")
  exitCustomGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number
  ): void {
    this.gameMatchService.exitCustomGame(client, roomId);
  }

  @SubscribeMessage("custom-room-list")
  getCustomGameList(@ConnectedSocket() client: Socket): void {
    this.gameMatchService.getCustomGameList(client);
  }

  @SubscribeMessage("ladder-game-match")
  handleConnectLadder(@ConnectedSocket() client: Socket): void {
    this.gameMatchService.handleLadderMatchStart(client);
  }

  @SubscribeMessage("ladder-game-match-cancel")
  handleDisconnectLadder(@ConnectedSocket() client: Socket): void {
    this.gameMatchService.handleLadderMatchcancel(client);
  }

  @SubscribeMessage("find-matches")
  async handleFindMatches(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ): Promise<GameResultResponse[]> {
    return await this.gameMatchService.handleFindMatches(jwt.id, client);
  }
}
