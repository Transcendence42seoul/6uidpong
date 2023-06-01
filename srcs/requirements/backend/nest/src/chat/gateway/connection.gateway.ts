import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ConnectionService } from "../service/connection/connection.service";
import { DisconnectionService } from "../service/connection/disconnection.service";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ConnectionGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly connectionService: ConnectionService) {}

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.connectionService.disconnect(client.id);
  }

  @SubscribeMessage("connection")
  async connectClient(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.connectionService.connect(jwt.id, client.id, this.server);
  }
}
