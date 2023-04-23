import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  Post,
  Body
} from "@nestjs/common";

import express, { Response } from "express";
import { FtAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { UserEntity } from "../user/user.entity";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get("/social/redirect/forty-two")
  @UseGuards(FtAuthGuard)
  async redirectFortyTwo() {}

  @Get("/social/callback/forty-two")
  @UseGuards(FtAuthGuard)
  callbackFortyTwo(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): void {
    const user = req.user;
    if (user.nickname == undefined) {
      res.status(HttpStatus.FOUND).redirect("/profile");
    } else {
      res.status(HttpStatus.FOUND).redirect("/profile");
    }
  }

  @Post("/isTwoFactor")
  async verifyTwoFactorAuth(@Body() body: { email: string, isTwoFactor: boolean }): Promise<UserEntity> {
    const { email, isTwoFactor } = body;
    return this.authService.verifyTwoFactorAuth(email, isTwoFactor);
  }

  @Post("/verifyVerificationCode")
  async verifyVerificationCode(@Body() { email, code }: { email: string, code: string }): Promise<boolean> {
    return this.authService.verifyVerificationCode(email, code);
  }
}
