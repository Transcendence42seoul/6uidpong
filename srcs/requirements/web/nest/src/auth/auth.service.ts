import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "src/user/user.entity";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: UserEntity): Promise<any> {
    const payload = {
      id: user.id,
      nickname: user.nickname,
      isTwoFactor: user.isTwoFactor,
    };
    return await this.jwtService.signAsync(payload);
  }
}
