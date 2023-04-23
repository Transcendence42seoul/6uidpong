import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";
import { JwtGuard } from "src/auth/jwt.guard";

@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/:id")
  @UseGuards(JwtGuard)
  async getUser(@Req() req: any): Promise<UserEntity> {
    if (req.user.id != req.params.id) {
      throw new UnauthorizedException();
    }
    return this.userService.findUser(req.params.id);
  }
}
