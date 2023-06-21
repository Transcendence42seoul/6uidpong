import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtPayload } from "jsonwebtoken";
import { Socket, Namespace } from "socket.io";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { WsJwtPayload } from "src/chat/utils/decorator/ws-jwt-payload.decorator";
import { GameResultResponse } from "../dto/game.dto";
import { GameMatchService } from "../service/match.service";

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

  // invite
  @SubscribeMessage("invite-game")
  async handleInviteGame(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody() opponent: number
  ): Promise<void> {
    await this.gameMatchService.handleInviteGame(
      jwt.id,
      client,
      opponent,
      this.server
    );
  }

  @SubscribeMessage("invite-success")
  async handleInviteSuccess(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number
  ): Promise<void> {
    const roomInfo = {
      roomId: roomId,
      password: null,
    };
    await this.gameMatchService.joinCustomGame(jwt.id, client, roomInfo);
  }

  @SubscribeMessage("invite-failed")
  async handleInviteFail(@MessageBody() roomId: number): Promise<void> {
    await this.gameMatchService.handleInviteFail(roomId, this.server);
  }

  // 일반 cutsom 방 생성
  @SubscribeMessage("custom-room-list")
  getCustomGameList(@ConnectedSocket() client: Socket): void {
    this.gameMatchService.getCustomGameList(client);
  }

  @SubscribeMessage("create-custom-room")
  async createCustomGame(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomInfo: {
      title: string;
      password: string | null;
    }
  ): Promise<void> {
    await this.gameMatchService.createCustomGame(jwt.id, client, roomInfo);
  }

  @SubscribeMessage("join-custom-room")
  async joinCustomGame(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomInfo: {
      roomId: number;
      password: string | null;
    }
  ): Promise<void> {
    this.gameMatchService.joinCustomGame(jwt.id, client, roomInfo);
  }

  @SubscribeMessage("exit-custom-room")
  async exitCustomGame(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody() roomId: number
  ): Promise<void> {
    await this.gameMatchService.exitCustomGame(jwt.id, roomId, this.server);
  }

  @SubscribeMessage("change-mode")
  async handleChangeMode(
    @MessageBody()
    roomInfo: {
      roomId: number;
      newMode: boolean;
    }
  ): Promise<void> {
    await this.gameMatchService.changeMode(roomInfo, this.server);
  }

  @SubscribeMessage("start-custom-room")
  async sstartCustomGame(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    roomInfo: {
      roomId: number;
      mode: boolean;
    }
  ): Promise<void> {
    await this.gameMatchService.customGameStart(client, roomInfo);
  }

  @SubscribeMessage("ladder-game-match")
  handleConnectLadder(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ): void {
    this.gameMatchService.handleLadderMatchStart(jwt.id, client);
  }

  @SubscribeMessage("ladder-game-match-cancel")
  handleDisconnectLadder(@WsJwtPayload() jwt: JwtPayload): void {
    this.gameMatchService.handleLadderMatchcancel(jwt.id);
  }

  @SubscribeMessage("find-matches")
  async handleFindMatches(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<GameResultResponse[]> {
    return await this.gameMatchService.handleFindMatches(jwt.id);
  }

}
