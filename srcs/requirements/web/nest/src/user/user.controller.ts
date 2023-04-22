import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";

@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/:id")
  async getUser(@Param("id") id: number): Promise<UserEntity> {
    return this.userService.findUser(id);
  }

  @Post("/:isTwoFactor")
  async verifyTwoFactorAuth(@Body() body: { email: string, isTwoFactor: boolean }): Promise<UserEntity> {
    const { email, isTwoFactor } = body;
    return this.userService.verifyTwoFactorAuth(email, isTwoFactor);
  }

  @Post("/:verifyVerificationCode")
  async verifyVerificationCode(@Body() { email, code }: { email: string, code: string }): Promise<boolean> {
    return this.userService.verifyVerificationCode(email, code);
  }
}
