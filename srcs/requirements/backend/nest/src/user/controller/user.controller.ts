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
  NotFoundException,
  Query,
  Post,
  Delete,
  DefaultValuePipe,
  BadRequestException,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from "@nestjs/common";
import { UserService } from "../service/user.service";
import { JwtAccessGuard } from "src/auth/guard/jwt-access.guard";
import { AuthService } from "src/auth/service/auth.service";
import { User } from "../entity/user.entity";
import { NicknameUpdateRequest } from "../dto/nickname-update-request";
import { TwoFactorAuthUpdateRequest } from "../dto/two-factor-auth-update-request";
import { UserResponse } from "../dto/user-response";
import { Pagination } from "src/utils/pagination/pagination";
import { FriendService } from "../service/friend.service";
import { FriendRequestService } from "../service/friend-request.service";
import { FriendResponse } from "../dto/friend-response";
import { FriendRequest } from "../entity/friend-request.entity";
import { FriendRequestResponse } from "../dto/friend-request-response";
import { PermissionGuard } from "src/auth/guard/permission.guard";
import { Friend } from "../entity/friend.entity";
import { BlockService } from "src/chat/service/dm/block.service";
import { Block } from "src/chat/entity/dm/block.entity";
import { UserProfileResponse } from "../dto/user-profile-response";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly friendService: FriendService,
    private readonly friendRequestService: FriendRequestService,
    private readonly blockService: BlockService
  ) {}

  @Get()
  async findAllUser(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("size", new DefaultValuePipe(10), ParseIntPipe) size: number
  ): Promise<Pagination<UserResponse>> {
    const [users, total]: [User[], number] = await this.userService.findAll({
      page,
      size,
    });
    const dtos: UserResponse[] = users.map((user) => new UserResponse(user));
    return new Pagination<UserResponse>({ results: dtos, total });
  }

  @Get("/search")
  async searchUser(
    @Query("nickname") nickname: string
  ): Promise<UserResponse[]> {
    const entities: User[] = await this.userService.search(nickname);

    return entities.map((entity) => new UserResponse(entity));
  }

  @Get("/:id")
  async findUser(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number
  ): Promise<UserResponse> {
    try {
      const user: User = await this.userService.findOne(id);
      const block: Block = await this.blockService.findOne(req.user.id, id);
      const friend: Friend = await this.friendService.findOne(req.user.id, id);
      return new UserProfileResponse(
        user,
        block ? true : false,
        friend ? true : false
      );
    } catch {
      throw new NotFoundException("user not exists.");
    }
  }

  @Get("/:id/image")
  @HttpCode(HttpStatus.NO_CONTENT)
  async streamImage(
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.userService.streamImage(res, id);
  }

  @Put("/:id/nickname")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNickname(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: NicknameUpdateRequest
  ): Promise<void> {
    await this.userService.updateNickname(id, body.nickname);
  }

  @Put("/:id/image")
  @UseGuards(PermissionGuard)
  @UseInterceptors(FileInterceptor("file", { dest: "uploads" }))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateImage(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200 }),
          new FileTypeValidator({ fileType: "image/jpeg" }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<void> {
    await this.userService.updateImage(id, file);
  }

  @Put("/:id/email/code")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async send2FACode(@Param("id", ParseIntPipe) id: number): Promise<void> {
    const { email } = await this.userService.findOne(id);
    await this.authService.send2FACode(id, email);
  }

  @Put("/:id/is2FA")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update2FA(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: TwoFactorAuthUpdateRequest
  ): Promise<void> {
    await this.authService.validate2FACode(id, body.code);
    await this.userService.updateIsTwoFactor(id, body.is2FA);
  }

  @Get("/:id/friends")
  @UseGuards(PermissionGuard)
  async findFriends(
    @Param("id", ParseIntPipe) userId: number
  ): Promise<FriendResponse[]> {
    const friends: Friend[] = await this.friendService.find(userId);
    return friends.map((friend) => new FriendResponse(friend));
  }

  @Post("/:id/friends")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createFriend(
    @Param("id", ParseIntPipe) userId: number,
    @Body("friendId", ParseIntPipe) friendId: number
  ): Promise<void> {
    await this.friendService.insert(userId, friendId);
  }

  @Delete("/:id/friends/:friendId")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFriend(
    @Param("id", ParseIntPipe) userId: number,
    @Param("friendId", ParseIntPipe) friendId: number
  ): Promise<void> {
    await this.friendService.delete(userId, friendId);
  }

  @Get("/:id/friend-requests")
  @UseGuards(PermissionGuard)
  async findFriendRequests(
    @Param("id", ParseIntPipe) userId: number
  ): Promise<FriendRequestResponse[]> {
    const friendRequests: FriendRequest[] =
      await this.friendRequestService.find(userId);
    return friendRequests.map(
      (friendRequest) => new FriendRequestResponse(friendRequest)
    );
  }

  @Post("/:id/friend-requests")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createFriendRequest(
    @Param("id", ParseIntPipe) fromId: number,
    @Body("toId", ParseIntPipe) toId: number
  ): Promise<void> {
    const friend: Friend = await this.friendService.findOne(fromId, toId);
    if (friend) {
      throw new BadRequestException("already friends.");
    }
    await this.friendRequestService.insert(fromId, toId);
  }

  @Delete("/:id/friend-requests/:fromId")
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFriendRequest(
    @Param("id", ParseIntPipe) toId: number,
    @Param("fromId", ParseIntPipe) fromId: number
  ): Promise<void> {
    await this.friendRequestService.delete(fromId, toId);
  }
}
