import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  HttpStatus,
  UseGuards,
  Post,
  Body,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "../service/auth.service";
import { UserService } from "src/user/service/user.service";
import { JwtRefreshGuard } from "../guard/jwt-refresh.guard";
import { FtGuard } from "../guard/ft.guard";
import { TwoFactorAuthDto } from "../dto/two-factor.auth";

const OAUTH_42_LOGIN_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`;

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Get("/social/redirect/forty-two")
  redirectFortytwo(@Res() res: Response): void {
    res.status(HttpStatus.FOUND).redirect(OAUTH_42_LOGIN_URL);
  }

  @Post("/social/callback/forty-two")
  @UseGuards(FtGuard)
  async callbackFortytwo(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<Object> {
    let user = await this.userService.findUserById(req.user.id);
    if (user?.is2FA) {
      this.authService.sendCodeByEmail(user.id, user.email);
      return { is2FA: true, id: user.id, accessToken: null };
    }
    if (!user) {
      user = await this.userService.createUser(req.user);
      res.status(HttpStatus.CREATED);
      res.setHeader("Location", `/api/v1/users/${user.id}`);
    }
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/token/refresh",
    });
    const accessToken = await this.authService.generateAccessToken(user.id);
    return { is2FA: false, id: user.id, accessToken: accessToken };
  }

  @Post("/2fa")
  async TwoFactorAuthentication(
    @Body() body: TwoFactorAuthDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<Object> {
    if (!(await this.authService.validateCode(body.id, body.code))) {
      throw new UnauthorizedException();
    }
    const refreshToken = await this.authService.generateRefreshToken(body.id);
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/token/refresh",
    });
    const accessToken = await this.authService.generateAccessToken(body.id);
    return { accessToken: accessToken };
  }

  @Get("/token/refresh")
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req: any): Promise<Object> {
    const accessToken = await this.authService.generateAccessToken(req.user.id);
    return { accessToken: accessToken };
  }
}