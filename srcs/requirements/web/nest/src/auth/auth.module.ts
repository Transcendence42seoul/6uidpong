import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { FtAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { FtStrategy } from "./ft.strategy";

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, FtAuthGuard],
})
export class AuthModule {}
