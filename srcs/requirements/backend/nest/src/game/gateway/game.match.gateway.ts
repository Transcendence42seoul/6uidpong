import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "src/user/service/user.service";
import { GameMatchService } from "../service/game.match.service";
import { WsJwtPayload } from "src/chat/utils/decorator/ws-jwt-payload.decorator";

@WebSocketGateway(80, {
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
export class GameMatchGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly gameMatchService: GameMatchService
  ) {}

  @SubscribeMessage("ladder-game-match")
  handleConnectLadder(@WsJwtPayload() jwt: JwtPayload, client: Socket): void {
    this.gameMatchService.handleLadderMatchStart(client);
  }

  @SubscribeMessage("ladder-game-match-cancel")
  handleDisconnectLadder(
    @WsJwtPayload() jwt: JwtPayload,
    client: Socket
  ): void {
    this.gameMatchService.handleLadderMatchcancel(client);
  }
}
