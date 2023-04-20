import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from "@nestjs/common";

import express, { Response } from "express";
import { FtAuthGuard } from "./auth.guard";

@Controller("api/v1/auth")
export class AuthController {
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
}
