import { Module } from "@nestjs/common";
import { GameRoomService } from "../service/game.room.service";
import { GameRoomGateway } from "../gateway/game.room.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameEntity } from "../entity/game.entity";
import { UserService } from "src/user/service/user.service";
import { UserModule } from "src/user/module/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity]), UserModule],
  providers: [GameRoomService, GameRoomGateway],
  exports: [GameRoomService],
})
export class GameRoomModule {}
