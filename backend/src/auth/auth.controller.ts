import { Controller, Get, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(FortyTwoAuthGuard)
  @Get('/login/forty-two')
  async loginFortyTwo() {
    return 'success';
  }

  @UseGuards(FortyTwoAuthGuard)
  @Get('/login/forty-two/callback')
  async loginFortyTwoCallback() {
    return 'success';
  }
}
