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
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { ChannelService } from "../service/channel/channel.service";
import { Channel } from "../entity/channel/channel.entity";
import { ChannelUser } from "../entity/channel/channel-user.entity";
import { ChannelResponse } from "../dto/channel/channel-response";
import { ChatResponse } from "../dto/channel/chat-response";
import { CreateRequest } from "../dto/channel/create-request";
import { CreateResponse } from "../dto/channel/create-response";
import { Ban } from "../entity/channel/ban.entity";
import { BanService } from "../service/channel/ban.service";
import { UserResponse } from "../dto/channel/user-response";
import { BanResponse } from "../dto/channel/ban-response";
import { MuteService } from "../service/channel/mute.service";

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
    private readonly muteService: MuteService
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
    const newChannel: Channel = await this.channelService.create(jwt.id, body);
    return new CreateResponse(newChannel);
  }

  @SubscribeMessage("join-channel")
  async join(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("info")
    info: { channelId: number; password: string }
  ): Promise<ChatResponse[]> {
    return await this.channelService.join(
      jwt.id,
      info.channelId,
      info.password,
      client,
      this.server
    );
  }

  @SubscribeMessage("send-channel")
  async send(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("to")
    to: { channelId: number; message: string }
  ): Promise<void> {
    if (await this.muteService.has(to.channelId, jwt.id)) {
      throw new WsException("can't send because muted user.");
    }
    await this.channelService.send(
      jwt.id,
      to.channelId,
      to.message,
      false,
      this.server
    );
  }

  @SubscribeMessage("delete-channel")
  async delete(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("channelId")
    channelId: number
  ): Promise<void> {
    await this.channelService.deleteChannel(channelId, jwt.id, this.server);
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
    await this.channelService.exit(channelId, jwt.id, client, this.server);
  }

  @SubscribeMessage("transfer-ownership")
  async transferOwnership(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.transferOwnership(
      jwt.id,
      info.channelId,
      info.userId,
      this.server
    );
  }

  @SubscribeMessage("add-admin")
  async addAdmin(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.addAdmin(
      jwt.id,
      info.channelId,
      info.userId,
      this.server
    );
  }

  @SubscribeMessage("delete-admin")
  async deleteAdmin(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.deleteAdmin(
      jwt.id,
      info.channelId,
      info.userId,
      this.server
    );
  }

  @SubscribeMessage("invite")
  async invite(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userIds: number[] }
  ): Promise<void> {
    await this.channelService.invite(
      jwt.id,
      info.channelId,
      info.userIds,
      this.server
    );
  }

  @SubscribeMessage("kick")
  async kick(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.kick(
      jwt.id,
      info.channelId,
      info.userId,
      this.server
    );
  }

  @SubscribeMessage("mute")
  async mute(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number; time: number }
  ): Promise<void> {
    await this.channelService.mute(
      jwt.id,
      info.channelId,
      info.userId,
      info.time,
      this.server
    );
  }

  @SubscribeMessage("ban")
  async ban(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.ban(
      jwt.id,
      info.channelId,
      info.userId,
      this.server
    );
  }

  @SubscribeMessage("unban")
  async unban(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; userId: number }
  ): Promise<void> {
    await this.channelService.unban(jwt.id, info.channelId, info.userId);
  }

  @SubscribeMessage("update-password")
  async updatePassword(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("info")
    info: { channelId: number; password: string }
  ): Promise<void> {
    await this.channelService.updatePassword(
      jwt.id,
      info.channelId,
      info.password
    );
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
}
