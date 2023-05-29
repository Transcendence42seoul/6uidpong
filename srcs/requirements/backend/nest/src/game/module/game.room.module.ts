import { Module } from "@nestjs/common";
import { GameRoomService } from "../service/game.room.service";
import { GameRoomGateway } from "../gateway/game.room.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameEntity } from "../entity/game.entity";

@Module({
    imports:[TypeOrmModule.forFeature([GameEntity])],
    providers: [GameRoomService, GameRoomGateway],
    exports: [GameRoomService],
})

export class GameRoomModule {}
