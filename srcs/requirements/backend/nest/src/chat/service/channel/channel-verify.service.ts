import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Channel } from "src/chat/entity/channel/channel.entity";
import { Mute } from "src/chat/entity/channel/mute.entity";
import { BanService } from "./ban.service";
import { ChannelRoomService } from "./channel-room.service";
import { MuteService } from "./mute.service";
import * as bcryptjs from "bcryptjs";
import { Socket } from "socket.io";

@Injectable()
export class ChannelVerifyService {
  constructor(
    private readonly muteService: MuteService,
    private readonly banService: BanService,
    private readonly roomService: ChannelRoomService
  ) {}

  async verifyJoin(
    channelId: number,
    userId: number,
    password: string,
    client: Socket
  ): Promise<void> {
    const channel: Channel = await this.roomService.findOne(channelId);
    if (!channel.isPublic) {
      throw new WsException("You can't join a private channel.");
    }
    if (await this.banService.includes(channelId, [userId])) {
      client.emit("join-banned");
      throw new WsException("can't join because banned.");
    }
    if (
      channel.password?.length > 0 &&
      (typeof password === "undefined" ||
        !(await bcryptjs.compare(password, channel.password)))
    ) {
      client.emit("incorrect-password");
      throw new WsException("incorrect password.");
    }
  }

  async verifySend(channelId: number, userId: number): Promise<void> {
    try {
      const mute: Mute = await this.muteService.findOne(channelId, userId);
      if (mute.limitedAt > new Date()) {
        throw new WsException("can't send because muted user.");
      }
      await this.muteService.delete(channelId, userId);
    } catch {}
  }
}
