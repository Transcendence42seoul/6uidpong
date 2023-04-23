import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { FtAuthGuard } from "./ft.guard";
import { AuthService } from "./auth.service";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get("/social/redirect/forty-two")
  @UseGuards(FtAuthGuard)
  async redirectFortyTwo() {}

  @Get("/social/callback/forty-two")
  @UseGuards(FtAuthGuard)
  async callbackFortyTwo(@Req() req: any): Promise<any> {
    const accessToken = await this.authService.generateAccessToken(req.user);
    return { accessToken: accessToken };
  }
}
