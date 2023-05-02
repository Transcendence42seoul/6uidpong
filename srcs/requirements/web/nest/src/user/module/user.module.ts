import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { UserEntity } from "../entity/user.entity";
import { UserService } from "../service/user.service";
import { UserController } from "../controller/user.controller";
import { AuthModule } from "src/auth/module/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule),
    CacheModule.register(),
  ],
  providers: [UserService],
  exports: [UserService, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
})
export class UserModule {}
