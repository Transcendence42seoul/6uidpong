import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";
import { JwtAccessGuard } from "src/auth/jwt-access.guard";

@Controller("api/v1/users")
@UseGuards(JwtAccessGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/:id")
  async getUser(@Req() req: any): Promise<UserEntity> {
    if (req.user.id != req.params.id) {
      throw new UnauthorizedException();
    }
    return this.userService.findUser(req.params.id);
  }
}
