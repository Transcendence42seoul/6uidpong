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
import { UserEntity } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DmChatResponseDto } from "../dto/dm/dm-chat-response.dto";
import { DmRoomsResponseDto } from "../dto/dm/dm-rooms-response.dto";
import { DmRoomUserEntity } from "../entity/dm/dm-room-user.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { ConnectionService } from "../service/connection.service";
import { DisconnectionService } from "../service/disconnection.service";
import { WsJwtPayload } from "../utils/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { DmChatsResponseDto } from "../dto/dm/dm-chats-response.dto";
import { EntityNotFoundError } from "typeorm";
import { DmChatEntity } from "../entity/dm/dm-chat.entity";
import { BlockService } from "../service/dm/block.service";

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
    private readonly connectionService: ConnectionService,
    private readonly disconnectionService: DisconnectionService,
    private readonly dmService: DmService,
    private readonly blockService: BlockService,
    private readonly userService: UserService
  ) {}

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.disconnectionService.updateUserInfo(client.id);
  }

  @SubscribeMessage("connection")
  async connectClient(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.connectionService.updateUserInfo(jwt.id, client.id);
  }

  @SubscribeMessage("find-dm-rooms")
  async findDmRooms(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<DmRoomsResponseDto[]> {
    return await this.dmService.findRooms(jwt.id);
  }

  @SubscribeMessage("join-dm")
  async joinDM(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<DmChatsResponseDto> {
    let roomUser: DmRoomUserEntity;
    try {
      roomUser = await this.dmService.findRoomUser(jwt.id, interlocutorId);
      await this.dmService.updateRoomUser(roomUser);
    } catch (error) {
      if (!(error instanceof EntityNotFoundError)) {
        throw error;
      }
      roomUser = await this.dmService.saveRoomUsers(jwt.id, interlocutorId);
    }
    client.join("d" + roomUser.roomId);
    const chats: DmChatEntity[] = await this.dmService.findChats(roomUser);

    return new DmChatsResponseDto(roomUser.roomId, roomUser.newMsgCount, chats);
  }

  @SubscribeMessage("send-dm")
  async sendDM(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to") to: { id: number; message: string }
  ): Promise<DmChatResponseDto> {
    try {
      const recipient: UserEntity = await this.userService.findOne(to.id);
      if (await this.blockService.isBlocked(jwt.id, recipient.id)) {
        throw new WsException(
          "You can't send a message to the user you have blocked."
        );
      }
      if (await this.blockService.isBlocked(recipient.id, jwt.id)) {
        throw new WsException(
          "You can't send a message because you have been blocked."
        );
      }
      const recipientRoomUser: DmRoomUserEntity =
        await this.dmService.findRoomUser(recipient.id, jwt.id);
      const roomSockets = await this.server
        .in("d" + recipientRoomUser.roomId)
        .fetchSockets();
      const isNotJoin: boolean = !roomSockets.find(
        (socket) => socket.id === recipient.socketId
      );

      const { id: chatId } = await this.dmService.saveChat(
        jwt.id,
        to.message,
        recipientRoomUser,
        isNotJoin
      );
      const chat: DmChatResponseDto = new DmChatResponseDto(
        await this.dmService.findChat(chatId)
      );
      if (recipient.status === "online") {
        const recipientSocket = await this.server
          .in(recipient.socketId)
          .fetchSockets();
        recipientSocket[0].emit("send-dm", chat);
      }
      return chat;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new WsException("invalid request.");
      }
      throw error;
    }
  }

  @SubscribeMessage("leave-dm")
  async leaveDM(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number
  ): Promise<void> {
    client.leave("d" + roomId);
  }

  @SubscribeMessage("delete-dm-room")
  async deleteDmRoom(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    try {
      const interlocutorRoomUser: DmRoomUserEntity =
        await this.dmService.findRoomUser(interlocutorId, jwt.id);
      if (interlocutorRoomUser.isExit) {
        await this.dmService.deleteRoom(interlocutorRoomUser.roomId);
      } else {
        await this.dmService.exitRoom(interlocutorRoomUser.roomId, jwt.id);
      }
      client.leave("d" + interlocutorRoomUser.roomId);
    } catch {
      throw new WsException("invalid request.");
    }
  }

  @SubscribeMessage("block-dm-user")
  async blockDmUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.create(jwt.id, interlocutorId);
  }

  @SubscribeMessage("unblock-dm-user")
  async unblockDmUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.delete(jwt.id, interlocutorId);
  }
}
