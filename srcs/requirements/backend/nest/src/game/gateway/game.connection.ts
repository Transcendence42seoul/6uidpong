import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/entity/user.entity";
import { UseGuards } from "@nestjs/common";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { WsJwtPayload } from "src/chat/utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";

@WebSocketGateway(80, {
  namespace: "game",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class GameConnectionGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly userService: UserService) {}

  @SubscribeMessage("connection")
  async connectGame(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ) {
    const user: User = await this.userService.findOne(jwt.id);
    await this.userService.updateStatus(user.id, client.id, "game");
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user: User = await this.userService.findBySocketId(client.id);
    if (user.status === "game") {
      await this.userService.updateStatus(user.id, "", "online");
    }
  }
}
