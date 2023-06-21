import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { JsonWebTokenError } from "jsonwebtoken";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token: string | undefined = this.extractToken(client);
    try {
      if (typeof token === "undefined") {
        throw new WsException("token not exists.");
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });
      client.data["user"] = payload;
    } catch (e) {
      client.emit("logout");
      if (e instanceof JsonWebTokenError) {
        throw new WsException("invalid token.");
      }
      throw e;
    }
    return true;
  }

  private extractToken(client: Socket): string | undefined {
    const { token } = client.handshake.auth;
    return token ? token : undefined;
  }
}
