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
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { DmChatResponse } from "../dto/dm/dm-chat-response.dto";
import { DmRoomResponse } from "../dto/dm/dm-rooms-response.dto";
import { DmRoomUser } from "../entity/dm/dm-room-user.entity";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { ConnectionService } from "../service/connection.service";
import { DisconnectionService } from "../service/disconnection.service";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { DmJoinResponse } from "../dto/dm/dm-join-response.dto";
import { EntityNotFoundError } from "typeorm";
import { DmChat } from "../entity/dm/dm-chat.entity";
import { BlockService } from "../service/dm/block.service";
import { ChannelService } from "../service/channel/channel.service";
import { Channel } from "../entity/channel/channel.entity";
import { ChannelUser } from "../entity/channel/channel-user.entity";
import { ChannelResponse } from "../dto/channel/channel-response.dto";
import { ChannelChat } from "../entity/channel/channel-chat.entity";
import { ChannelChatResponse } from "../dto/channel/channel-chat-response.dto";
import { ChannelCreateRequest } from "../dto/channel/channel-create-request.dto";
import * as bcryptjs from "bcryptjs";
import { ChannelCreateResponse } from "../dto/channel/channel-create-response.dto";

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
    private readonly channelService: ChannelService,
    private readonly userService: UserService
  ) {}

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    await this.disconnectionService.update(client.id);
  }

  @SubscribeMessage("connection")
  async connectClient(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.connectionService.update(jwt.id, client.id);
  }

  @SubscribeMessage("find-dm-rooms")
  async findDmRooms(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<DmRoomResponse[]> {
    return await this.dmService.findRooms(jwt.id);
  }

  @SubscribeMessage("join-dm")
  async joinDM(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<DmJoinResponse> {
    let roomUser: DmRoomUser;
    try {
      roomUser = await this.dmService.findUserOrFail(jwt.id, interlocutorId);
      await this.dmService.updateUser(roomUser);
    } catch (e) {
      if (!(e instanceof EntityNotFoundError)) {
        throw e;
      }
      roomUser = await this.dmService.saveUsers(jwt.id, interlocutorId);
    }
    client.join("d" + roomUser.roomId);
    const chats: DmChat[] = await this.dmService.findChats(roomUser);

    return new DmJoinResponse(roomUser.roomId, roomUser.newMsgCount, chats);
  }

  @SubscribeMessage("send-dm")
  async sendDM(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to") to: { id: number; message: string }
  ): Promise<DmChatResponse> {
    try {
      const recipient: User = await this.userService.findOneOrFail(to.id);
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
      const recipientRoomUser: DmRoomUser = await this.dmService.findUserOrFail(
        recipient.id,
        jwt.id
      );
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
      const chat: DmChatResponse = new DmChatResponse(
        await this.dmService.findChat(chatId)
      );
      if (recipient.status === "online") {
        const recipientSocket = await this.server
          .in(recipient.socketId)
          .fetchSockets();
        recipientSocket[0].emit("send-dm", chat);
      }
      return chat;
    } catch (e) {
      throw e;
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

  @SubscribeMessage("block-dm-user")
  async blockDmUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.save(jwt.id, interlocutorId);
  }

  @SubscribeMessage("unblock-dm-user")
  async unblockDmUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.delete(jwt.id, interlocutorId);
  }

  @SubscribeMessage("find-all-channels")
  async findAllChannels(): Promise<ChannelResponse[]> {
    return await this.channelService.findAllChannels();
  }

  @SubscribeMessage("find-my-channels")
  async findMyChannels(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<ChannelResponse[]> {
    return await this.channelService.findMyChannels(jwt.id);
  }

  @SubscribeMessage("create-channel")
  async createChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody()
    body: ChannelCreateRequest
  ): Promise<ChannelCreateResponse> {
    const newChannel: Channel = await this.channelService.createChannel(
      jwt.id,
      body
    );
    return new ChannelCreateResponse(newChannel);
  }

  @SubscribeMessage("join-channel")
  async joinChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("info")
    info: { channelId: number; password: string | undefined }
  ): Promise<ChannelChatResponse[]> {
    let channelUser: ChannelUser;
    try {
      channelUser = await this.channelService.findUserOrFail(
        info.channelId,
        jwt.id
      );
    } catch {
      const channel: Channel = await this.channelService.findChannelOrFail(
        info.channelId
      );
      if (
        channel.password.length !== 0 &&
        !(await bcryptjs.compare(info.password, channel.password))
      ) {
        throw new WsException("invalid password");
      }
      channelUser = await this.channelService.saveUser(info.channelId, jwt.id);
    }
    client.join("c" + info.channelId);
    const user: User = await this.userService.findOneOrFail(jwt.id);
    client.broadcast
      .to("c" + info.channelId)
      .emit("newly-joined-user", { nickname: user.nickname });
    const chats: ChannelChat[] = await this.channelService.findChats(
      info.channelId,
      channelUser
    );
    return chats.map((chat) => {
      return new ChannelChatResponse(chat);
    });
  }

  @SubscribeMessage("send-channel-message")
  async sendMessageToChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to")
    to: { channelId: number; message: string }
  ): Promise<void> {}
}
