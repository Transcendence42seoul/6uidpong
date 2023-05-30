import { Module } from "@nestjs/common";
import { GameEntity } from "../entity/game.entity";
import { UserModule } from "src/user/module/user.module";
import { GameMatchGateway } from "../gateway/game.match.gateway";
import { GameMatchService } from "../service/game.match.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WsJwtAccessGuard } from "src/chat/guard/ws-jwt-access.guard";

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity])],
  providers: [GameMatchGateway, GameMatchService, WsJwtAccessGuard],
})
export class GameModule {}
