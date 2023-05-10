import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/module/user.module";
import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmRoomEntity } from "../entity/dm-room.entity";
import { DmRoomUserEntity } from "../entity/dm-room-user.entity";
import { ChatGateway } from "../gateway/chat.gateway";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ChatService } from "../service/chat.service";
import { DmBlocklistEntity } from "../entity/dm-blocklist.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DmRoomEntity,
      DmRoomUserEntity,
      DmChatEntity,
      DmBlocklistEntity,
    ]),
    UserModule,
  ],
  providers: [ChatService, ChatGateway, WsJwtAccessGuard],
})
export class ChatModule {}
