import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";

@WebSocketGateway({
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {}

  async handleDisconnect(@ConnectedSocket() client: Socket) {}
}
