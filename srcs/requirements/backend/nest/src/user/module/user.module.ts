import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import { UserController } from "../controller/user.controller";
import { AuthModule } from "src/auth/module/auth.module";
import { FriendEntity } from "../entity/friend.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FriendEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
