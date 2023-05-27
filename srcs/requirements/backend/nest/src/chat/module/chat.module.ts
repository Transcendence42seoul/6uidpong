import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/module/user.module";
import { DmChat } from "../entity/dm/dm-chat.entity";
import { DmRoom } from "../entity/dm/dm-room.entity";
import { DmRoomUser } from "../entity/dm/dm-room-user.entity";
import { ChatGateway } from "../gateway/chat.gateway";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { ConnectionService } from "../service/connection.service";
import { DisconnectionService } from "../service/disconnection.service";
import { Block } from "../entity/dm/block.entity";
import { BlockService } from "../service/dm/block.service";
import { Channel } from "../entity/channel/channel.entity";
import { ChannelUser } from "../entity/channel/channel-user.entity";
import { ChannelChat } from "../entity/channel/channel-chat.entity";
import { ChannelService } from "../service/channel/channel.service";
import { Mute } from "../entity/channel/mute.entity";
import { Ban } from "../entity/channel/ban.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DmRoom,
      DmRoomUser,
      DmChat,
      Block,
      Channel,
      ChannelUser,
      ChannelChat,
      Ban,
      Mute,
    ]),
    UserModule,
  ],
  providers: [
    DmService,
    ChannelService,
    BlockService,
    ConnectionService,
    DisconnectionService,
    ChatGateway,
    WsJwtAccessGuard,
  ],
})
export class ChatModule {}
