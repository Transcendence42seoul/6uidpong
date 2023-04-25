import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Query,
  BadRequestException,
  HttpStatus,
  UseGuard,
  Post,
  Body,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { JwtRefreshGuard } from "./jwt-refresh.guard";
import { CreateUserDto } from "src/user/dto/create-user.dto";

const OAUTH_42_LOGIN_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`;

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get("/social/redirect/forty-two")
  redirect42LoginPage(@Res() res: Response): void {
    res.status(HttpStatus.FOUND).redirect(OAUTH_42_LOGIN_URL);
  }

  @Get("/social/callback/forty-two")
  async login(
    @Query("code") code: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    if (!code) {
      throw new BadRequestException();
    }
    const profile = await this.authService.receiveOAuthProfile(code);
    let user = await this.userService.findUser(profile.id);
    if (!user) {
      user = await this.userService.createUser(new CreateUserDto(profile.id, profile.email, profile.profileImage));
    }
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    res.cookie("REF-TOKEN", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "api/v1/auth/token/refresh",
    });
    const accessToken = await this.authService.generateAccessToken(user);
    res.json({ accessToken: accessToken });
  }

  @Get("/token/refresh")
  @UseGuard(JwtRefreshGuard)
  async refreshToken(@Req() req: Request): Promise<any> {
    const user = await this.userService.findUser(req.user.id);
    if (!user) {
      throw new BadRequestException();
    }
    const accessToken = await this.authService.generateAccessToken(user);
    return {accessToken: accessToken};
  ): void {
    const user = req.user;
    if (user.nickname == undefined) {
      res.status(HttpStatus.FOUND).redirect("/profile");
    } else {
      res.status(HttpStatus.FOUND).redirect("/profile");
    }
  }

  @Post("/isTwoFactor")
  async verifyTwoFactorAuth(@Body() {email} ): Promise<boolean> {
    return this.authService.verifyTwoFactorAuth(email);
  }

  @Post("/verifyVerificationCode")
  async verifyVerificationCode(@Body() { email, code }: { email: string, code: string }): Promise<boolean> {
    return this.authService.verifyVerificationCode(email, code);
  }
}
