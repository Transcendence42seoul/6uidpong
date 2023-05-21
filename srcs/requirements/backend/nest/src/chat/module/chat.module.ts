import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/module/user.module";
import { DmChatEntity } from "../entity/dm/dm-chat.entity";
import { DmRoomEntity } from "../entity/dm/dm-room.entity";
import { DmRoomUserEntity } from "../entity/dm/dm-room-user.entity";
import { ChatGateway } from "../gateway/chat.gateway";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { ConnectionService } from "../service/connection.service";
import { DisconnectionService } from "../service/disconnection.service";
import { BlockEntity } from "../entity/dm/block-list.entity";
import { BlockService } from "../service/dm/block.service";
import { ChannelEntity } from "../entity/channel/channel.entity";
import { ChannelUserEntity } from "../entity/channel/channel-user.entity";
import { ChannelChatEntity } from "../entity/channel/channel-chat.entity";
import { ChannelService } from "../service/channel/channel.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DmRoomEntity,
      DmRoomUserEntity,
      DmChatEntity,
      BlockEntity,
      ChannelEntity,
      ChannelUserEntity,
      ChannelChatEntity,
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
