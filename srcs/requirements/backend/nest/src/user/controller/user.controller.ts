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
  UnauthorizedException,
  NotFoundException,
  Query,
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

  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  @Get("/search")
  async search(@Query("nickname") nickname: string): Promise<UserEntity[]> {
    return await this.userService.search(nickname);
  }

  @Get("/:id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<UserEntity> {
    try {
      return await this.userService.findOne(id);
    } catch (EntityNotFoundError) {
      throw new NotFoundException();
    }
  }

  @Put("/:id/nickname")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(
    @Param("id", ParseIntPipe) id: number,
    @Body() { nickname }: UpdateNicknameDto
  ): Promise<void> {
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

  @Put("/:id/email/code")
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendCodeByEmail(@Param("id", ParseIntPipe) id: number): Promise<void> {
    try {
      const { email } = await this.userService.findOne(id);
      await this.authService.sendCodeByEmail(id, email);
    } catch (EntityNotFoundError) {
      throw new NotFoundException();
    }
  }

  @Put("/:id/is2FA")
  @HttpCode(HttpStatus.NO_CONTENT)
  async update2FA(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTwoFactorAuthDto
  ): Promise<void> {
    try {
      await this.authService.validateCode(id, body.code);
    } catch {
      throw new UnauthorizedException("invalid code");
    }

    await this.userService.updateIsTwoFactor(id, body.is2FA);
  }
}
