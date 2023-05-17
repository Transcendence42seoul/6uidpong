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
  Post,
  BadRequestException,
  Delete,
  DefaultValuePipe,
} from "@nestjs/common";
import { UserService } from "../service/user.service";
import { JwtAccessGuard } from "src/auth/guard/jwt-access.guard";
import { AuthService } from "src/auth/service/auth.service";
import { UserEntity } from "../entity/user.entity";
import { UpdateImageDto } from "../dto/update-image.dto";
import { UpdateNicknameDto } from "../dto/update-nickname.dto";
import { UpdateTwoFactorAuthDto } from "../dto/update-2fa.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import { Pagination } from "src/utils/pagination/pagination";
import { FriendService } from "../service/friend.service";
import { FriendRequestService } from "../service/friend-request.service";
import { FriendResponseDto } from "../dto/friend-response.dto";
import { FriendRequestEntity } from "../entity/friend-request.entity";
import { FriendRequestResponseDto } from "../dto/friend-request-response.dto";
import { PermissionGuard } from "src/auth/guard/permission.guard";

@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly friendService: FriendService,
    private readonly friendRequestService: FriendRequestService
  ) {}

  @Get()
  async findAllUser(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("size", new DefaultValuePipe(10), ParseIntPipe) size: number
  ): Promise<Pagination<UserResponseDto>> {
    const [entities, total]: [UserEntity[], number] =
      await this.userService.findAll({ page, size });
    const dtos: UserResponseDto[] = entities.map((entity) => {
      return new UserResponseDto(entity);
    });
    return new Pagination<UserResponseDto>({ results: dtos, total });
  }

  @Get("/search")
  async searchUser(
    @Query("nickname") nickname: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("size", new DefaultValuePipe(10), ParseIntPipe) size: number
  ): Promise<Pagination<UserResponseDto>> {
    const [entities, total]: [UserEntity[], number] =
      await this.userService.search(nickname, {
        page,
        size,
      });
    const dtos: UserResponseDto[] = entities.map((entity) => {
      return new UserResponseDto(entity);
    });
    return new Pagination<UserResponseDto>({ results: dtos, total });
  }

  @Get("/:id")
  async findUser(
    @Param("id", ParseIntPipe) id: number
  ): Promise<UserResponseDto> {
    try {
      const entity: UserEntity = await this.userService.findOne(id);
      return new UserResponseDto(entity);
    } catch (EntityNotFoundError) {
      throw new NotFoundException();
    }
  }

  @Put("/:id/nickname")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(
    @Param("id", ParseIntPipe) id: number,
    @Body() { nickname }: UpdateNicknameDto
  ): Promise<void> {
    await this.userService.updateNickname(id, nickname);
  }

  @Put("/:id/image")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImage(
    @Param("id", ParseIntPipe) id: number,
    @Body() { image }: UpdateImageDto
  ): Promise<void> {
    await this.userService.updateImage(id, image);
  }

  @Put("/:id/email/code")
  @UseGuards(PermissionGuard)
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
  @UseGuards(PermissionGuard)
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

  @Get("/:id/friends")
  @UseGuards(PermissionGuard)
  async findFriends(
    @Param("id", ParseIntPipe) userId: number
  ): Promise<FriendResponseDto[]> {
    return await this.friendService.find(userId);
  }

  @Post("/:id/friends")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveFriend(
    @Param("id", ParseIntPipe) userId: number,
    @Body("friendId", ParseIntPipe) friendId: number
  ): Promise<void> {
    try {
      await this.friendService.save(userId, friendId);
    } catch {
      throw new BadRequestException();
    }
  }

  @Delete("/:id/friends/:friendId")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFriend(
    @Param("id", ParseIntPipe) userId: number,
    @Param("friendId", ParseIntPipe) friendId: number
  ): Promise<void> {
    try {
      await this.friendService.delete(userId, friendId);
    } catch {
      throw new NotFoundException();
    }
  }

  @Get("/:id/friend-requests")
  @UseGuards(PermissionGuard)
  async findFriendRequests(
    @Param("id", ParseIntPipe) userId: number
  ): Promise<FriendRequestResponseDto[]> {
    const entities: FriendRequestEntity[] =
      await this.friendRequestService.find(userId);

    return entities.map((entity) => {
      return new FriendRequestResponseDto(entity);
    });
  }

  @Post("/:id/friend-requests")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveFriendRequest(
    @Param("id", ParseIntPipe) fromId: number,
    @Body("toId", ParseIntPipe) toId: number
  ): Promise<void> {
    await this.friendRequestService.save(fromId, toId);
  }

  @Delete("/:id/friend-requests/:toId")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFriendRequest(
    @Param("id", ParseIntPipe) fromId: number,
    @Param("toId", ParseIntPipe) toId: number
  ): Promise<void> {
    await this.friendRequestService.delete(fromId, toId);
  }
}
