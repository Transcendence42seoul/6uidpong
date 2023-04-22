import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { FtAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { FtStrategy } from "./ft.strategy";

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, FtAuthGuard],
})
export class AuthModule {}
