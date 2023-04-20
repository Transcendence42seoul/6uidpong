import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FtStrategy } from "./ft.strategy";

@Module({
  controllers: [AuthController],
  providers: [AuthService, FtStrategy],
})
export class AuthModule {}
