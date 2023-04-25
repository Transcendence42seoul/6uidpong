import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./jwt-access.guard";
import { JwtRefreshGuard } from "./jwt-refresh.guard";

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessGuard, JwtRefreshGuard],
})
export class AuthModule {}
