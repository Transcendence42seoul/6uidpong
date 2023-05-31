import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/entity/user.entity";

@WebSocketGateway(80, {
  namespace: "game",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly userService: UserService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const user: User = await this.userService.findOne(client.id);
    await this.userService.updateStatus(user.id, "game");
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user: User = await this.userService.findOne(client.id);
    if (user.status === "game") {
      await this.userService.updateStatus(user.id, "online");
    }
  }
}
