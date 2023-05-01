import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Post
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAccessGuard } from "src/auth/jwt-access.guard";


@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/:id")
  async getUser(@Param("id", ParseIntPipe) id: number): Promise<any> {
    return this.userService.findUser(id);
  }

  @Put("/:id/nickname")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(@Param("id", ParseIntPipe) id: number, 
                       @Body("nickname") nickname: string): Promise<void> {
    await this.userService.updateNickname(id, nickname);
  }

  @Put("/:id/profileImage")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateProfileImage(@Param("id", ParseIntPipe) id: number,
                           @Body("profileImage") profileImage: string): Promise<void> {
    await this.userService.updateProfileImage(id, profileImage);
  }

  @Post("/isTwoFactor")
  @UseGuards(JwtAccessGuard)
  async verifyTwoFactorAuth(
    @Body() body: { id: number; email: string }
  ): Promise<boolean> {
    return this.userService.verifyTwoFactorAuth(body);
  }

  @Post("/verifyVerificationCode")
  @UseGuards(JwtAccessGuard)
  async verifyVerificationCode(
    @Body() body: { id: number; code: string; email: string }
  ): Promise<boolean> {
    return this.userService.verifyVerificationCode(body);
  }
}
