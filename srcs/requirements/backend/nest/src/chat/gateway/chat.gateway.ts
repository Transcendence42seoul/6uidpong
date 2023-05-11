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
import { UserService } from "src/user/service/user.service";
import { DmChatEntity } from "../entity/dm-chat.entity";
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
    await this.userService.updateStatus(client.id, "offline");
    await this.userService.updateSocketId(client.id, "");
  }

  @SubscribeMessage("connection")
  async connectClient(@ConnectedSocket() client: Socket): Promise<void> {
    const userId: number = client.data.user.id;

    await this.userService.updateStatus(userId, "online");
    await this.userService.updateSocketId(userId, client.id);
  }

  @SubscribeMessage("dm-rooms")
  async findDmRooms(@ConnectedSocket() client: Socket): Promise<void> {
    const userId: number = client.data.user.id;

    const rooms: Object[] = await this.chatService.findDmRooms(userId);
    client.emit("dm-rooms", rooms);
  }

  @SubscribeMessage("dm-chats")
  async findDmChats(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number
  ): Promise<void> {
    const userId: number = client.data.user.id;

    const chats: DmChatEntity[] = await this.chatService.findDmChats(
      userId,
      roomId
    );
    client.emit("dm-chats", chats);
  }

  // @SubscribeMessage("dm")
  // async sendDM(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody("to") to: { id: number },
  //   @MessageBody("message") message: string
  // ): Promise<void> {
  //   const userId: number = client.data.user.id;

  //   const sender = await this.userService.findUserById(userId);
  //   const recipient = await this.userService.findUserById(to.id);

  //   if (await this.chatService.isBlocked(sender.id, recipient.id)) {
  //     throw new WsException(
  //       "You can't send a message to the user you have blocked."
  //     );
  //   }
  //   if (await this.chatService.isBlocked(recipient.id, sender.id)) {
  //     throw new WsException(
  //       "You can't send a message because you have been blocked."
  //     );
  //   }

  //   await this.chatService.saveDM(userId, to.roomId, message);
  //   if (recipient.socketId == "") {
  //     return;
  //   }
  // }
}
