import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token: string | undefined = this.extractToken(client);
    if (typeof token === "undefined") {
      throw new WsException("token not exists");
    }
    try {
      const payload: Object = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });
      client.data["user"] = payload;
    } catch {
      throw new WsException("invalid token");
    }
    return true;
  }

  private extractToken(client: Socket): string | undefined {
    // const [type, token]: string[] =
    //   client.handshake.headers.authorization?.split(" ") ?? [];
    // return type === "Bearer" ? token : undefined;
    const { token } = client.handshake.auth;
    return token ? token : undefined;
  }
}
