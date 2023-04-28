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
  Session,
} from "@nestjs/common";
import { Response, Request } from "express";
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
    private readonly userService: UserService
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
  ): Promise<{ accessToken: string }> {
    let user = await this.userService.findUser(req.user.id);

    if (user?.isTwoFactor) {
      // res.json({ isTwoFactor: "true", id: user.id });
      // 이메일 전송 후 인증코드 유지
      const code = this.authService.generateVerificationCode();
      this.authService.sendVerificationCodeByEmail(user.email, code);
      req.session.code = code;
      const accessToken = await this.authService.generateAccessToken(user);
      return { accessToken };
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
    return { accessToken };
  }

  @Post("/verifyCode")
  async verifyCode(
    @Body() body: { id: number; code: string },
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>
  ): Promise<any> {
    console.log(session.code);
    const user = await this.userService.findUser(body.id);
    if (!user) {
      throw new BadRequestException();
    }
    const code = session.code;
    if (code === body.code) {
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

  @Post("/isTwoFactor")
  async verifyTwoFactorAuth(
    @Body() body: { id: number; email: string },
    @Req() req: any
  ): Promise<boolean> {
    return this.authService.verifyTwoFactorAuth(body, req);
  }

  @Post("/verifyVerificationCode")
  async verifyVerificationCode(
    @Body() body: { code: string },
    @Req() req: any
  ): Promise<boolean> {
    const { code } = body;
    const storedVerificationCode = req.session.verificationCode;
    return this.authService.verifyVerificationCode(
      code,
      storedVerificationCode,
      req.session.user.id,
      req.session.user.email
    );
  }
}
