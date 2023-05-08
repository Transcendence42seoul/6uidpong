import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DmChatEntity } from "../entity/chat.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ChatService } from "../service/chat.service";

@WebSocketGateway({
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결 해제 ❌`);
  }

  @SubscribeMessage("connectionDM")
  async connectionDM(@ConnectedSocket() client: Socket): Promise<void> {
    const dmRoomInfo: Object[] = await this.chatService.findDmRoomInfo(
      client.data.user.id
    );
    client.emit("dmRoomInfo", dmRoomInfo);
  }

  @SubscribeMessage("joinDM")
  async joinDM(
    @ConnectedSocket() client: Socket,
    @MessageBody("room_id") roomId: number
  ): Promise<void> {
    const dmChats: DmChatEntity[] = await this.chatService.findDmChats(
      roomId,
      client.data.user.id
    );
    if (dmChats.length === 0) {
      throw new WsException("invalid request");
    }
    client.join(roomId.toString());
    client.emit("dmChats", dmChats);
  }
}
