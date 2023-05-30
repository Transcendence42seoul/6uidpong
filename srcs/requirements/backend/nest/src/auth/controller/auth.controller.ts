import {
  Controller,
  Get,
  Req,
  Res,
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
import { TwoFactorAuthRequest } from "../dto/two-factor-auth-request";
import { User } from "src/user/entity/user.entity";
import { EntityNotFoundError } from "typeorm";
import { CallbackResponse } from "../dto/callback-response";
import { AccessTokenResponse } from "../dto/access-token-response";

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Get("/social/redirect/forty-two")
  redirectFortytwo(@Res() res: Response): void {
    res
      .status(HttpStatus.FOUND)
      .redirect(
        `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`
      );
  }

  @Post("/social/callback/forty-two")
  @UseGuards(FtGuard)
  async callbackFortytwo(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<CallbackResponse> {
    let user: User;
    try {
      user = await this.userService.findOne(req.user.id);
      res.status(HttpStatus.OK);
      if (user.is2FA) {
        this.authService.send2FACode(user.id, user.email);
        return new CallbackResponse(true, user.id);
      }
    } catch (e) {
      if (!(e instanceof EntityNotFoundError)) {
        throw e;
      }
      user = await this.userService.insert(req.user);
    }
    res.cookie("refresh", await this.authService.genRefreshToken(user.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/token/refresh",
    });

    return new CallbackResponse(
      false,
      user.id,
      await this.authService.genAccessToken(user.id)
    );
  }

  @Post("/2fa")
  async TwoFactorAuthentication(
    @Body() body: TwoFactorAuthRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessTokenResponse> {
    await this.authService.validate2FACode(body.id, body.code);
    res.cookie("refresh", await this.authService.genRefreshToken(body.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/token/refresh",
    });

    return new AccessTokenResponse(
      await this.authService.genAccessToken(body.id)
    );
  }

  @Get("/token/refresh")
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req: any): Promise<AccessTokenResponse> {
    return new AccessTokenResponse(
      await this.authService.genAccessToken(req.user.id)
    );
  }
}
