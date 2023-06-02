import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/module/user.module";
import { DmChat } from "../entity/dm/dm-chat.entity";
import { DmRoom } from "../entity/dm/dm-room.entity";
import { DmRoomUser } from "../entity/dm/dm-room-user.entity";
import { DmGateway } from "../gateway/dm.gateway";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { ConnectionService } from "../service/connection/connection.service";
import { Block } from "../entity/dm/block.entity";
import { BlockService } from "../service/dm/block.service";
import { Channel } from "../entity/channel/channel.entity";
import { ChannelUser } from "../entity/channel/channel-user.entity";
import { ChannelChat } from "../entity/channel/chat.entity";
import { ChannelService } from "../service/channel/channel.service";
import { Mute } from "../entity/channel/mute.entity";
import { Ban } from "../entity/channel/ban.entity";
import { BanService } from "../service/channel/ban.service";
import { MuteService } from "../service/channel/mute.service";
import { ChannelGateway } from "../gateway/channel.gateway";
import { ConnectionGateway } from "../gateway/connection.gateway";
import { ChannelRoomService } from "../service/channel/channel-room.service";
import { ChannelChatService } from "../service/channel/channel-chat.service";
import { ChannelUserService } from "../service/channel/channel-user.service";

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
    forwardRef(() => UserModule),
  ],
  providers: [
    DmService,
    ChannelRoomService,
    ChannelService,
    ChannelChatService,
    ChannelUserService,
    BanService,
    MuteService,
    BlockService,
    ConnectionService,
    ConnectionGateway,
    DmGateway,
    ChannelGateway,
    WsJwtAccessGuard,
  ],
  exports: [BlockService],
})
export class ChatModule {}
