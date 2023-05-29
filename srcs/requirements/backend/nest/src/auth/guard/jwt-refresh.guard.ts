import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string | undefined = this.extractTokenFromCookies(request);
    if (typeof token === "undefined") {
      throw new UnauthorizedException();
    }
    try {
      const payload: Object = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      });
      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    const token: string | null = request.cookies["refresh"];
    return token ? token : undefined;
  }
}
