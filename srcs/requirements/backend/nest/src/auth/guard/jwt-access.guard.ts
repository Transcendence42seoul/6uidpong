import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();
    const token: string | undefined = this.extractTokenFromHeader(request);
    if (typeof token === undefined) {
      throw new UnauthorizedException();
    }
    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });
      if (!this.isValidPermission(request, payload.id)) {
        throw new NotFoundException();
      }
      request["user"] = payload;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token]: string[] =
      request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private isValidPermission(request: Request, userId: string): boolean {
    if (
      request.params.id &&
      request.method != "GET" &&
      request.params.id != userId
    ) {
      return false;
    }
    return true;
  }
}
