import {
  ConnectedSocket,
  OnGatewayConnection,
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
import { ConnectionService } from "../service/connection.service";

@WebSocketGateway(80, {
  namespace: "game",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class GameConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly connectionService: ConnectionService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      await this.connectionService.connect(client, this.server);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.connectionService.disconnect(client.id);
  }
}
