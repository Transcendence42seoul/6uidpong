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
import { Ban } from "../entity/channel/ban.entity";
import { BanService } from "../service/channel/ban.service";
import { MuteService } from "../service/channel/mute.service";
import { ChannelUserResponse } from "../dto/channel/channel-user-response.dto";
import { BanResponse } from "../dto/channel/ban-response.dto";
import { Block } from "../entity/dm/block.entity";
import { BlockResponse } from "../dto/dm/block-response.dto";

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
    private readonly banService: BanService,
    private readonly muteService: MuteService,
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
      roomUser = await this.dmService.insertUsers(jwt.id, interlocutorId);
    }
    const roomName: string = "d" + roomUser.roomId;
    client.join(roomName);
    const chats: DmChat[] = await this.dmService.findChats(roomUser);

    return new DmJoinResponse(roomUser.roomId, roomUser.newMsgCount, chats);
  }

  @SubscribeMessage("send-dm")
  async sendDM(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to") to: { id: number; message: string }
  ): Promise<DmChatResponse> {
    await this.blockService.validate(jwt.id, to.id);
    const recipient: DmRoomUser = await this.dmService.findUserOrFail(
      to.id,
      jwt.id
    );
    const roomName: string = "d" + recipient.roomId;
    const sockets = await this.server.in(roomName).fetchSockets();
    const isJoined: boolean = sockets.some(
      (socket) => socket.id === recipient.user.socketId
    );
    const { id: chatId } = await this.dmService.insertChat(
      jwt.id,
      to.message,
      recipient,
      isJoined
    );
    const chat: DmChatResponse = new DmChatResponse(
      await this.dmService.findChat(chatId)
    );
    if (recipient.user.status === "online") {
      this.server.to(recipient.user.socketId).emit("send-dm", chat);
    }
    return chat;
  }

  @SubscribeMessage("leave-dm")
  async leaveDM(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number
  ): Promise<void> {
    const roomName: string = "d" + roomId;
    client.leave(roomName);
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
    const roomName: string = "d" + interRoomUser.roomId;
    client.leave(roomName);
  }

  @SubscribeMessage("block-dm-user")
  async blockDmUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.insert(jwt.id, interlocutorId);
  }

  @SubscribeMessage("find-block-users")
  async findBlockUsers(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<BlockResponse[]> {
    const blocks: Block[] = await this.blockService.find(jwt.id);
    return blocks.map((block) => new BlockResponse(block));
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
      await this.banService.validate(info.channelId, jwt.id);
      const channel: Channel = await this.channelService.findChannelOrFail(
        info.channelId
      );
      if (
        channel.password.length !== 0 &&
        !(await bcryptjs.compare(info.password, channel.password))
      ) {
        throw new WsException("invalid password");
      }
      channelUser = await this.channelService.insertUser(
        info.channelId,
        jwt.id
      );
    }
    const roomName: string = "c" + info.channelId;
    client.join(roomName);
    client.broadcast
      .to(roomName)
      .emit("newly-joined-user", { nickname: channelUser.user.nickname });
    const chats: ChannelChat[] = await this.channelService.findChats(
      info.channelId,
      channelUser
    );
    return chats.map((chat) => new ChannelChatResponse(chat));
  }

  @SubscribeMessage("send-channel-message")
  async sendMessageToChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to")
    to: { channelId: number; message: string }
  ): Promise<void> {
    await this.muteService.validate(to.channelId, jwt.id);
    const channelUsers: ChannelUser[] = await this.channelService.findUsers(
      to.channelId
    );
    if (channelUsers.length === 0) {
      throw new WsException("invalid channel id");
    }
    const channelUsersWithoutMe: ChannelUser[] = channelUsers.filter(
      (channelUser) => channelUser.userId !== jwt.id
    );
    if (channelUsers.length === channelUsersWithoutMe.length) {
      throw new WsException("user not channel member");
    }
    const roomName: string = "c" + to.channelId;
    const sockets = await this.server.in(roomName).fetchSockets();
    const notJoinedUsers: ChannelUser[] = channelUsersWithoutMe.filter(
      (channelUser) =>
        !sockets.some((socket) => socket.id === channelUser.user.socketId)
    );
    const chat: ChannelChat = await this.channelService.insertChat(
      jwt.it,
      to.channelId,
      to.message,
      notJoinedUsers
    );
    const onlineSockets: string[] = channelUsers
      .filter((channelUser) => channelUser.user.status === "online")
      .map((onlineChannelUser) => onlineChannelUser.user.socketId);
    this.server
      .to(onlineSockets)
      .emit("send-channel-message", new ChannelChatResponse(chat));
  }

  @SubscribeMessage("delete-channel")
  async deleteChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("channelId")
    channelId: number
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      channelId,
      jwt.id
    );
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelService.deleteChannel(channelId);
  }

  @SubscribeMessage("leave-channel")
  async leaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody("channelId")
    channelId: number
  ): Promise<void> {
    const roomName: string = "c" + channelId;
    client.leave(roomName);
  }

  @SubscribeMessage("exit-channel")
  async exitChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("channelId")
    channelId: number
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      channelId,
      jwt.id
    );
    if (channelUser.isOwner) {
      throw new WsException(
        "The owner cannot exit the channel. Please transfer ownership to another user and try again."
      );
    }
    await this.channelService.deleteUser(channelId, jwt.id);
    const roomName: string = "c" + channelId;
    client.leave(roomName);
    this.server
      .to(roomName)
      .emit("leave-channel-user", { nickname: channelUser.user.nickname });
  }

  @SubscribeMessage("transfer-ownership")
  async transferOwnership(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const targetChannelUser: ChannelUser =
      await this.channelService.findUserOrFail(info.channelId, info.userId);
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelService.transferOwnership(
      info.channelId,
      jwt.id,
      info.userId
    );
    const roomName: string = "c" + info.channelId;
    this.server.to(roomName).emit("transfer-ownership", {
      old: channelUser.user.nickname,
      new: targetChannelUser.user.nickname,
    });
  }

  @SubscribeMessage("update-channel-admin")
  async updateChannelAdmin(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number; value: boolean }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const targetChannelUser: ChannelUser =
      await this.channelService.findUserOrFail(info.channelId, info.userId);
    if (!channelUser.isOwner || targetChannelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelService.updateIsAdmin(
      info.channelId,
      info.userId,
      info.value
    );
    const event: string = info.value
      ? "add-channel-admin"
      : "delete-channel-admin";
    const roomName: string = "c" + info.channelId;
    this.server
      .to(roomName)
      .emit(event, { nickname: targetChannelUser.user.nickname });
  }

  @SubscribeMessage("invite-channel")
  async inviteChannel(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userIds: number[] }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const to: User[] = await this.userService.find(info.userIds);
    if (to.length === 0) {
      throw new WsException("user not exists");
    }
    await this.channelService.insertUsers(info.channelId, info.userIds);
    const roomName: string = "c" + info.channelId;
    this.server.to(roomName).emit("invited-users", {
      from: channelUser.user.nickname,
      to: to.map((user) => user.nickname),
    });
  }

  @SubscribeMessage("kick-channel-user")
  async kickChannelUser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const kickChannelUser: ChannelUser =
      await this.channelService.findUserOrFail(info.channelId, info.userId);
    if (
      !channelUser.isAdmin ||
      kickChannelUser.isOwner ||
      (!channelUser.isOwner && kickChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    await this.channelService.deleteUser(info.channelId, info.userId);
    const roomName: string = "c" + info.channelId;
    if (kickChannelUser.user.status === "online") {
      const channelSockets = await this.server.in(roomName).fetchSockets();
      const kickUserSocket = channelSockets.find(
        (socket) => socket.id === kickChannelUser.user.socketId
      );
      if (kickUserSocket) {
        kickUserSocket.leave(roomName);
        kickUserSocket.emit("kicked-channel");
      }
    }
    this.server
      .to(roomName)
      .emit("newly-kicked-user", { nickname: kickChannelUser.user.nickname });
  }

  @SubscribeMessage("mute-channel-user")
  async muteChanneluser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number; limitedAt: Date }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const targetChannelUser: ChannelUser =
      await this.channelService.findUserOrFail(info.channelId, info.userId);
    if (
      !channelUser.isAdmin ||
      targetChannelUser.isOwner ||
      (!channelUser.isOwner && targetChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    await this.muteService.mute(info.channelId, info.userId, info.limitedAt);
    const roomName: string = "c" + info.channelId;
    this.server.to(roomName).emit("newly-mute-user", {
      nickname: targetChannelUser.user.nickname,
      limitedAt: info.limitedAt,
    });
  }

  @SubscribeMessage("ban-channel-user")
  async banChanneluser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    const targetChannelUser: ChannelUser =
      await this.channelService.findUserOrFail(info.channelId, info.userId);
    if (
      !channelUser.isAdmin ||
      targetChannelUser.isOwner ||
      (!channelUser.isOwner && targetChannelUser.isAdmin)
    ) {
      throw new WsException("permission denied");
    }
    await this.banService.ban(info.channelId, info.userId);
    const roomName: string = "c" + info.channelId;
    this.server
      .to(roomName)
      .emit("newly-banned-user", { nickname: targetChannelUser.user.nickname });
  }

  @SubscribeMessage("unban-channel-user")
  async unbanChanneluser(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    if (!channelUser.isAdmin) {
      throw new WsException("permission denied");
    }
    await this.banService.unban(info.channelId, info.userId);
  }

  @SubscribeMessage("find-channel-users")
  async findChannelUsers(
    @MessageBody("channelId")
    channelId: number
  ): Promise<ChannelUserResponse[]> {
    const channelUsers: ChannelUser[] = await this.channelService.findUsers(
      channelId
    );
    return channelUsers.map(
      (channelUser) => new ChannelUserResponse(channelUser)
    );
  }

  @SubscribeMessage("find-channel-admins")
  async findChannelAdmins(
    @MessageBody("channelId")
    channelId: number
  ): Promise<ChannelUserResponse[]> {
    const channelAdmins: ChannelUser[] = await this.channelService.findAdmins(
      channelId
    );
    return channelAdmins.map(
      (channelUser) => new ChannelUserResponse(channelUser)
    );
  }

  @SubscribeMessage("find-channel-ban-users")
  async findChannelBanUsers(
    @MessageBody("channelId")
    channelId: number
  ): Promise<BanResponse[]> {
    const banUsers: Ban[] = await this.banService.findUsers(channelId);
    return banUsers.map((ban) => new BanResponse(ban));
  }

  @SubscribeMessage("update-password")
  async updatePassword(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; password: string | undefined }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelService.updatePassword(info.channelId, info.password);
    const roomName: string = "c" + info.channelId;
    this.server.to(roomName).emit("update-password");
  }
}
