import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './ft.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FortyTwoAuthGuard],
})
export class AuthModule {}
