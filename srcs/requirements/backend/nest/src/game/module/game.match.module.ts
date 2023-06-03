import { Module } from "@nestjs/common";
import { GameEntity } from "../entity/game.entity";
import { GameMatchGateway } from "../gateway/game.match.gateway";
import { GameMatchService } from "../service/game.match.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";
import { GameConnectionGateway } from "../gateway/game.connection";
import { GameRoomService } from "../service/game.room.service";
import { GameRoomGateway } from "../gateway/game.room.gateway";
import { UserModule } from "src/user/module/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity]), UserModule],
  providers: [
    GameConnectionGateway,
    GameMatchGateway,
    GameMatchService,
    GameRoomGateway,
    GameRoomService,
    WsJwtAccessGuard,
  ],
})
export class GameModule {}
