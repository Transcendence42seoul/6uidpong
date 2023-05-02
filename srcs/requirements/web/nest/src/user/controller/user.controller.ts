import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Query,
} from "@nestjs/common";
import { UserService } from "../service/user.service";
import { JwtAccessGuard } from "src/auth/guard/jwt-access.guard";
import { AuthService } from "src/auth/service/auth.service";
import { UserEntity } from "../entity/user.entity";

@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Get("/:id")
  async getUser(@Param("id", ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.findUser(id);
  }

  @Put("/:id/nickname")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(
    @Param("id", ParseIntPipe) id: number,
    @Body("nickname") nickname: string
  ): Promise<void> {
    await this.userService.updateNickname(id, nickname);
  }

  @Put("/:id/image")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImage(
    @Param("id", ParseIntPipe) id: number,
    @Body("image") image: string
  ): Promise<void> {
    await this.userService.updateImage(id, image);
  }

  @Put("/:id/is2FA")
  @HttpCode(HttpStatus.NO_CONTENT)
  async update2FA(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { code: string; email: string; is2FA: boolean }
  ): Promise<void> {
    if (!(await this.authService.validateCode(id, body.code))) {
      throw new UnauthorizedException();
    }
    await this.userService.updateIsTwoFactor(id, body.email, body.is2FA);
  }

  @Post("/:id/email/code")
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendCodeByEmail(@Param("id", ParseIntPipe) id: number): Promise<void> {
    const user = await this.userService.findUser(id);
    await this.authService.sendCodeByEmail(id, user.email);
  }
}
