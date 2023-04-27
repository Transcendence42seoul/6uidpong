import { HttpModule } from "@nestjs/axios";
import {
  forwardRef,
  Module,
  MiddlewareConsumer,
  NestModule,
} from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OauthGuard } from "./oauth.guard";
import { JwtAccessGuard } from "./jwt-access.guard";
import { JwtRefreshGuard } from "./jwt-refresh.guard";
import { AuthMiddleware } from "./auth.middleware";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

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
  providers: [AuthService, JwtAccessGuard, JwtRefreshGuard, OauthGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(),
        session({
          secret: process.env.SESSION_SECRET,
          resave: false,
          saveUninitialized: false,
          cookie: { secure: false, maxAge: 300000 },
        }),
        AuthMiddleware
      )
      .forRoutes("/api/v1/auth/*");
  }
}
