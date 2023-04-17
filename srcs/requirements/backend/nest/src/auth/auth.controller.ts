import { Controller, Get, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from './auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  @UseGuards(FortyTwoAuthGuard)
  @Get('/social/redirect/forty-two')
  async redirectFortyTwo() {
    return 'success';
  }

  @UseGuards(FortyTwoAuthGuard)
  @Get('/social/callback/forty-two')
  async callbackFortyTwo() {
    return 'success';
  }
}
