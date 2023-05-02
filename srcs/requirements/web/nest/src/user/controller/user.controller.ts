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
  ConflictException,
} from "@nestjs/common";
import { UserService } from "../service/user.service";
import { JwtAccessGuard } from "src/auth/guard/jwt-access.guard";
import { AuthService } from "src/auth/service/auth.service";
import { UserEntity } from "../entity/user.entity";
import { UpdateImageDto } from "../dto/update-image.dto";
import { UpdateNicknameDto } from "../dto/update-nickname.dto";
import { UpdateTwoFactorAuthDto } from "../dto/update-2fa.dto";

@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Get("/:id")
  async getUser(@Param("id", ParseIntPipe) id: number): Promise<UserEntity> {
    return await this.userService.findUserById(id);
  }

  @Put("/:id/nickname")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(
    @Param("id", ParseIntPipe) id: number,
    @Body() { nickname }: UpdateNicknameDto
  ): Promise<void> {
    const user = await this.userService.findUserByNickname(nickname);
    if (user) {
      throw new ConflictException("Nickname already exists.");
    }
    await this.userService.updateNickname(id, nickname);
  }

  @Put("/:id/image")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImage(
    @Param("id", ParseIntPipe) id: number,
    @Body() { image }: UpdateImageDto
  ): Promise<void> {
    await this.userService.updateImage(id, image);
  }

  @Post("/:id/email/code")
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendCodeByEmail(@Param("id", ParseIntPipe) id: number): Promise<void> {
    const { email } = await this.userService.findUserById(id);
    await this.authService.sendCodeByEmail(id, email);
  }

  @Put("/:id/is2FA")
  @HttpCode(HttpStatus.NO_CONTENT)
  async update2FA(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTwoFactorAuthDto
  ): Promise<void> {
    if (!(await this.authService.validateCode(id, body.code))) {
      throw new UnauthorizedException();
    }
    await this.userService.updateIsTwoFactor(id, body.is2FA);
  }
}
