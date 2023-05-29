import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { ChannelService } from "../service/channel/channel.service";
import { Channel } from "../entity/channel/channel.entity";
import { ChannelUser } from "../entity/channel/channel-user.entity";
import { ChannelResponse } from "../dto/channel/channel-response";
import { ChannelChat } from "../entity/channel/chat.entity";
import { ChatResponse } from "../dto/channel/chat-response";
import { CreateRequest } from "../dto/channel/create-request";
import { CreateResponse } from "../dto/channel/create-response";
import { Ban } from "../entity/channel/ban.entity";
import { BanService } from "../service/channel/ban.service";
import { MuteService } from "../service/channel/mute.service";
import { UserResponse } from "../dto/channel/user-response";
import { BanResponse } from "../dto/channel/ban-response";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe())
@UseGuards(WsJwtAccessGuard)
export class ChannelGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(
    private readonly channelService: ChannelService,
    private readonly banService: BanService,
    private readonly muteService: MuteService,
    private readonly userService: UserService
  ) {}

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
  async create(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody()
    body: CreateRequest
  ): Promise<CreateResponse> {
    const newChannel: Channel = await this.channelService.createChannel(
      jwt.id,
      body
    );
    return new CreateResponse(newChannel);
  }

  @SubscribeMessage("join-channel")
  async join(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("info")
    info: { channelId: number; password: string }
  ): Promise<ChatResponse[]> {
    let channelUser: ChannelUser;
    try {
      channelUser = await this.channelService.findUserOrFail(
        info.channelId,
        jwt.id
      );
    } catch {
      await this.banService.validate(info.channelId, jwt.id);
      await this.channelService.validatePassword(info.channelId, info.password);
      channelUser = await this.channelService.insertUser(
        info.channelId,
        jwt.id
      );
    }
    const chats: ChannelChat[] = await this.channelService.findChats(
      info.channelId,
      channelUser
    );
    client.join("c" + info.channelId);
    return chats.map((chat) => new ChatResponse(chat));
  }

  @SubscribeMessage("send-channel")
  async send(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("to")
    to: { channelId: number; message: string }
  ): Promise<void> {
    await this.muteService.validate(to.channelId, jwt.id);
    await this.channelService.sendChat(
      jwt.it,
      to.channelId,
      to.message,
      this.server
    );
  }

  @SubscribeMessage("delete-channel")
  async delete(
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
  async leave(
    @ConnectedSocket() client: Socket,
    @MessageBody("channelId")
    channelId: number
  ): Promise<void> {
    client.leave("c" + channelId);
  }

  @SubscribeMessage("exit")
  async exit(
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
    client.leave("c" + channelId);
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
    if (!channelUser.isOwner) {
      throw new WsException("permission denied");
    }
    await this.channelService.transferOwnership(
      info.channelId,
      jwt.id,
      info.userId
    );
  }

  @SubscribeMessage("update-admin")
  async updateAdmin(
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
  }

  @SubscribeMessage("invite")
  async invite(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userIds: number[] }
  ): Promise<void> {
    const channelUser: ChannelUser = await this.channelService.findUserOrFail(
      info.channelId,
      jwt.id
    );
    if (!channelUser.isAdmin) {
      throw new WsException("permission denied");
    }
    const to: User[] = await this.userService.find(info.userIds);
    if (to.length === 0) {
      throw new WsException("user not exists");
    }
    await this.channelService.insertUsers(info.channelId, info.userIds);
  }

  @SubscribeMessage("kick")
  async kick(
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
  }

  @SubscribeMessage("mute")
  async mute(
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
  }

  @SubscribeMessage("ban")
  async ban(
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
  }

  @SubscribeMessage("unban")
  async unban(
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
  async findUsers(
    @MessageBody("channelId")
    channelId: number
  ): Promise<UserResponse[]> {
    const channelUsers: ChannelUser[] = await this.channelService.findUsers(
      channelId
    );
    return channelUsers.map((channelUser) => new UserResponse(channelUser));
  }

  @SubscribeMessage("find-admins")
  async findAdmins(
    @MessageBody("channelId")
    channelId: number
  ): Promise<UserResponse[]> {
    const channelAdmins: ChannelUser[] = await this.channelService.findAdmins(
      channelId
    );
    return channelAdmins.map((channelUser) => new UserResponse(channelUser));
  }

  @SubscribeMessage("find-bans")
  async findBanUsers(
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
  }
}
