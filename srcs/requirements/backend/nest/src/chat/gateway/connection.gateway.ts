import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { ConnectionService } from "../service/connection/connection.service";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
export class ConnectionGateway
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
