import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DmChatEntity } from "../entity/chat.entity";
import { DmRoomEntity } from "../entity/dm-rooms.entity";
import { ChatGateway } from "../gateway/chat.gateway";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { ChatService } from "../service/chat.service";

@Module({
  imports: [TypeOrmModule.forFeature([DmRoomEntity, DmChatEntity])],
  providers: [ChatService, ChatGateway, WsJwtAccessGuard],
})
export class ChatModule {}
