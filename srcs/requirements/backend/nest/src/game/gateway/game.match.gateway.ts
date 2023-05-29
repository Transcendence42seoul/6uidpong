import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPayload } from "jsonwebtoken";
import { UserService } from "src/user/service/user.service";
import { GameMatchService } from "../service/game.match.service";
import { WsJwtPayload } from "../utils/ws-jwt-payload.decorator";

@WebSocketGateway(80, {
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
    namespace: "/game"
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
  handleConnectLadder(
    @WsJwtPayload() jwt: JwtPayload,
    client: Socket
  ): void {
    this.gameMatchService.handleLadderMatchStart(client);
    // const rooms = this.gameMatchService.getRooms();
    // const result = rooms.filter(
    //   ({ user1, user2 }) => jwt.id === user1 || jwt.id === user2
    // );
    // if (result) {
    //   const user = await this.userService.findUserById(jwt.id);
    //   client.join(result[0].id.toString());
    //   this.server.emit(user.socketId, "ladder-game-matched");
    // }
  }

  @SubscribeMessage("ladder-game-match-cancel")
  handleDisconnectLadder(@WsJwtPayload() jwt: JwtPayload,
  client: Socket
  ): void {
    this.gameMatchService.handleLadderMatchcancel(client);
  }
}