import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { ChatResponse } from "../dto/dm/chat-response";
import { RoomResponse } from "../dto/dm/room-response";
import { DmRoomUser } from "../entity/dm/dm-room-user.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { JoinResponse } from "../dto/dm/join-response";
import { BlockService } from "../service/dm/block.service";
import { Block } from "../entity/dm/block.entity";
import { BlockResponse } from "../dto/dm/block-response";
import { EntityNotFoundError } from "typeorm";
import { DmChat } from "../entity/dm/dm-chat.entity";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe())
@UseGuards(WsJwtAccessGuard)
export class DmGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(
    private readonly dmService: DmService,
    private readonly blockService: BlockService
  ) {}

  @SubscribeMessage("find-rooms")
  async findRooms(@WsJwtPayload() jwt: JwtPayload): Promise<RoomResponse[]> {
    return await this.dmService.findRooms(jwt.id);
  }

  @SubscribeMessage("join-dm")
  async join(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<JoinResponse> {
    let roomUser: DmRoomUser;
    try {
      roomUser = await this.dmService.findUserOrFail(jwt.id, interlocutorId);
      await this.dmService.updateUser(roomUser);
    } catch (e) {
      if (!(e instanceof EntityNotFoundError)) {
        throw e;
      }
      roomUser = await this.dmService.insertUsers(jwt.id, interlocutorId);
    }
    client.join("d" + roomUser.roomId);
    const chats: DmChat[] = await this.dmService.findChats(roomUser);
    return new JoinResponse(roomUser.roomId, roomUser.newMsgCount, chats);
  }

  @SubscribeMessage("send-dm")
  async send(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to") to: { id: number; message: string }
  ): Promise<ChatResponse> {
    await this.blockService.validate(jwt.id, to.id);
    const recipient: DmRoomUser = await this.dmService.findUserOrFail(
      to.id,
      jwt.id
    );
    const sockets = await this.server.in("d" + recipient.roomId).fetchSockets();
    const isJoined: boolean = sockets.some(
      (socket) => socket.id === recipient.user.socketId
    );
    const { id: chatId } = await this.dmService.insertChat(
      jwt.id,
      to.message,
      recipient,
      isJoined
    );
    const chat: ChatResponse = new ChatResponse(
      await this.dmService.findChat(chatId)
    );
    if (recipient.user.status === "online") {
      this.server.to(recipient.user.socketId).emit("send-dm", chat);
    }
    return chat;
  }

  @SubscribeMessage("leave-dm")
  async leave(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number
  ): Promise<void> {
    client.leave("d" + roomId);
  }

  @SubscribeMessage("delete-room")
  async deleteRoom(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    const interRoomUser: DmRoomUser = await this.dmService.findUserOrFail(
      interlocutorId,
      jwt.id
    );
    if (interRoomUser.isExit) {
      await this.dmService.deleteRoom(interRoomUser.roomId);
    } else {
      await this.dmService.exitRoom(interRoomUser.roomId, jwt.id);
    }
    client.leave("d" + interRoomUser.roomId);
  }

  @SubscribeMessage("find-block-users")
  async findBlockUsers(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<BlockResponse[]> {
    const blocks: Block[] = await this.blockService.find(jwt.id);
    return blocks.map((block) => new BlockResponse(block));
  }

  @SubscribeMessage("block")
  async block(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.insert(jwt.id, interlocutorId);
  }

  @SubscribeMessage("unblock")
  async unblock(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.delete(jwt.id, interlocutorId);
  }
}
