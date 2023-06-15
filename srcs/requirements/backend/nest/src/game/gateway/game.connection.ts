import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
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
      client.emit("logout");
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.connectionService.disconnect(client.id);
  }
}
