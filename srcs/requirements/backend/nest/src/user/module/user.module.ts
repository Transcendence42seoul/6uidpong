import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import { UserController } from "../controller/user.controller";
import { AuthModule } from "src/auth/module/auth.module";
import { FriendRequest } from "../entity/friend-request.entity";
import { FriendRequestService } from "../service/friend-request.service";
import { Friend } from "../entity/friend.entity";
import { FriendService } from "../service/friend.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend, FriendRequest]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, FriendService, FriendRequestService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
