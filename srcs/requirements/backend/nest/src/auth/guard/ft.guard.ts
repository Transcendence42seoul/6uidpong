import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class FtGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const code: string | null = request.body.code;
    if (!code) {
      throw new BadRequestException();
    }
    try {
      const accessToken: string = await this.receiveOauthAccessToken(code);
      const headers = { Authorization: `Bearer ${accessToken}` };
      const { data } = await lastValueFrom(
        this.httpService.get("https://api.intra.42.fr/v2/me", {
          headers,
        })
      );
      request["user"] = data;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  async receiveOauthAccessToken(code: string): Promise<string> {
    const headers = { "Content-Type": "application/json" };
    const body = {
      grant_type: "authorization_code",
      client_id: process.env.OAUTH_42_CLIENT_ID,
      client_secret: process.env.OAUTH_42_CLIENT_SECRET,
      code: code,
      redirect_uri: `https://${process.env.HOST_NAME}/auth/social/callback/forty-two`,
    };
    const { data } = await lastValueFrom(
      this.httpService.post("https://api.intra.42.fr/oauth/token", body, {
        headers,
      })
    );
    return data.access_token;
  }
}
