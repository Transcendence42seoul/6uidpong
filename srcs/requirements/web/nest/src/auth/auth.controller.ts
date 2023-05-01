import {
  Controller,
  Get,
  Req,
  Res,
  BadRequestException,
  HttpStatus,
  UseGuards,
  Post,
  Body,
  Inject,
} from "@nestjs/common";
import { Response } from "express";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { JwtRefreshGuard } from "./jwt-refresh.guard";
import { OauthGuard } from "./oauth.guard";
import { CreateUserDto } from "src/user/dto/create-user.dto";

const OAUTH_42_LOGIN_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`;

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  @Get("/social/redirect/forty-two")
  redirectFortytwo(@Res() res: Response): void {
    res.status(HttpStatus.FOUND).redirect(OAUTH_42_LOGIN_URL);
  }

  @Get("/social/callback/forty-two")
  @UseGuards(OauthGuard)
  async callbackFortytwo(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    let user = await this.userService.findUser(req.user.id);
    if (user?.isTwoFactor) {
      const code = this.authService.generateVerificationCode();
      this.authService.sendVerificationCodeByEmail(user.email, code);
      // req.session.code = code;  << 인메모리캐쉬로 변경
      await this.cacheManager.set(
        req.user.id.toString(),
        code.toString(),
        300000
      );
      return { isTwoFactor: true, id: user.id, accessToken: null };
    }
    if (!user) {
      user = await this.userService.createUser(
        new CreateUserDto(req.user.id, req.user.image.link)
      );
    }
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/token/refresh",
    });
    const accessToken = await this.authService.generateAccessToken(user);
    return { isTwoFactor: false, id: null, accessToken: accessToken };
  }

  @Post("/login/verifyCode")
  async verifyCode(
    @Body() body: { id: number; code: string },
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const user = await this.userService.findUser(body.id);
    if (!user) {
      throw new BadRequestException();
    }
    const code = await this.cacheManager.get(body.id.toString());
    if (code === body.code) {
      await this.cacheManager.reset();
      // 프론트에서 코드 받아서 확인하고 확인됬으면 아래 실행
      const refreshToken = await this.authService.generateRefreshToken(user.id);
      res.cookie("refresh", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth/token/refresh",
      });
      const accessToken = await this.authService.generateAccessToken(user);
      res.json({ accessToken: accessToken });
    }
  }

  @Get("/token/refresh")
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req: any): Promise<any> {
    const user = await this.userService.findUser(req.user.id);
    if (!user) {
      throw new BadRequestException();
    }
    const accessToken = await this.authService.generateAccessToken(user);
    return { accessToken: accessToken };
  }

}
