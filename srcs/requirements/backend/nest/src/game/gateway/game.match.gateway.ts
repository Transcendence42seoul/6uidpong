import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "src/user/service/user.service";
import { GameMatchService } from "../service/game.match.service";
import { WsJwtPayload } from "src/chat/utils/decorator/ws-jwt-payload.decorator";

@WebSocketGateway(80, {
  cors: {
    namespace: "game",
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
export class GameMatchGateway {
  @WebSocketServer()
  server: Namespace;

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
