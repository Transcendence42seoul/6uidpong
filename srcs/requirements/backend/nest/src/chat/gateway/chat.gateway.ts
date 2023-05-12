import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserEntity } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmRoomUserEntity } from "../entity/dm-room-user.entity";
import { DmRoomEntity } from "../entity/dm-room.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ChatService } from "../service/chat.service";

@WebSocketGateway(80, {
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UseGuards(WsJwtAccessGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.userService.updateStatus(client.id, "online");
    await this.userService.updateSocketId(client.id, client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.userService.updateStatus(client.id, "offline");
    await this.userService.updateSocketId(client.id, "");
  }

  @SubscribeMessage("find-dm-rooms")
  async findDmRooms(@ConnectedSocket() client: Socket): Promise<Object[]> {
    const userId: number = client.data.user.id;
    return await this.chatService.findDmRooms(userId);
  }

  @SubscribeMessage("join-dm")
  async joinDM(
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<Object> {
    const userId: number = client.data.user.id;
    let roomUser: DmRoomUserEntity | undefined =
      await this.chatService.findRoomUser(userId, interlocutorId);

    if (roomUser?.isExit) {
      await this.chatService.updateEnterInfo(roomUser);
    } else if (typeof roomUser === undefined) {
      roomUser = await this.chatService.createRoomInfo(userId, interlocutorId);
    }
    client.join("d" + roomUser.roomId);

    return await this.chatService.findDmChats(roomUser);
  }

  @SubscribeMessage("send-dm")
  async sendDM(
    @ConnectedSocket() client: Socket,
    @MessageBody("to") to: { userId: number; roomId: number },
    @MessageBody("message") message: string
  ): Promise<DmChatEntity> {
    const userId: number = client.data.user.id;

    const sender: UserEntity = await this.userService.findUserById(userId);
    const recipient: UserEntity | null = await this.userService.findUserById(
      to.userId
    );

    if (typeof recipient === null) {
      throw new WsException("invalid recipient user id.");
    }
    if (await this.chatService.isBlocked(sender.id, recipient.id)) {
      throw new WsException(
        "You can't send a message to the user you have blocked."
      );
    }
    if (await this.chatService.isBlocked(recipient.id, sender.id)) {
      throw new WsException(
        "You can't send a message because you have been blocked."
      );
    }

    const chat: DmChatEntity = await this.chatService.saveDM(
      userId,
      to.roomId,
      message
    );
    if (recipient.socketId == "") {
      return;
    }

    const roomSockets = await this.server.in("d" + to.roomId).fetchSockets();
    if (!roomSockets.find((socket) => socket.id === recipient.socketId)) {
      await this.chatService.updateHasNewMsg(to.roomId, recipient.id, true);
    }

    const recipientSocket = await this.server
      .in(recipient.socketId)
      .fetchSockets();
    recipientSocket[0].emit("send-dm", message);

    return chat;
  }
}
