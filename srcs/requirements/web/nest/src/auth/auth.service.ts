import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { lastValueFrom } from "rxjs";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserEntity } from "src/user/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) {}

  async receiveOauthAccessToken(code: string): Promise<string> {
    const headers = { "Content-Type": "application/json" };
    const body = {
      grant_type: "authorization_code",
      client_id: process.env.OAUTH_42_CLIENT_ID,
      client_secret: process.env.OAUTH_42_CLIENT_SECRET,
      code: code,
      redirect_uri: `https://${process.env.HOST_NAME}/auth/social/callback/forty-two`,
    };
    try {
      const { data } = await lastValueFrom(
        this.httpService.post("https://api.intra.42.fr/oauth/token", body, {
          headers,
        })
      );
      return data.access_token;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async receiveOAuthProfile(code: string): Promise<CreateUserDto> {
    const accessToken = await this.receiveOauthAccessToken(code);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const { data } = await lastValueFrom(
      this.httpService.get("https://api.intra.42.fr/v2/me", {
        headers,
      })
    );
    return new CreateUserDto(data.id, data.email, data.image.link);
  }

  async generateAccessToken(user: UserEntity): Promise<any> {
    const payload = {
      id: user.id,
      nickname: user.nickname,
      isTwoFactor: user.isTwoFactor,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      expiresIn: "2m",
    });
    return accessToken;
  }

  async generateRefreshToken(id: number): Promise<any> {
    const payload = {
      id: id,
    };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: "7d",
    });
    return refreshToken;
  }
}
