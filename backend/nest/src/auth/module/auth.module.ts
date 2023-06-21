import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { User } from "src/user/entity/user.entity";
import { UserModule } from "src/user/module/user.module";
import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../service/auth.service";
import { FtGuard } from "../guard/ft.guard";
import { JwtAccessGuard } from "../guard/jwt-access.guard";
import { PermissionGuard } from "../guard/permission.guard";

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    CacheModule.register(),
  ],
  providers: [AuthService, JwtAccessGuard, FtGuard, PermissionGuard],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
