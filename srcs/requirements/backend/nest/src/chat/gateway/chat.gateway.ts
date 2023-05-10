import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/service/user.service";
import { DmUserEntity } from "../entity/dm-user.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ChatService } from "../service/chat.service";

@WebSocketGateway(80, {
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {}

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    // const userId: number = client.data.user.id;
    // console.log(`Client disconnected ${userId}`);
    // await this.userService.updateStatus(userId, "offline");
  }

  @SubscribeMessage("findDmList")
  async findDmList(@ConnectedSocket() client: Socket): Promise<void> {
    const userId: number = client.data.user.id;

    const dmRooms: DmUserEntity[] = await this.chatService.findDmRooms(userId);
    dmRooms.forEach((roomId) => client.join("d" + roomId));

    await this.userService.updateStatus(userId, "online");
    const dmRoomInfo: Object[] = await this.chatService.findDmList(userId);

    client.emit("dmRoomInfo", dmRoomInfo);
  }
}
