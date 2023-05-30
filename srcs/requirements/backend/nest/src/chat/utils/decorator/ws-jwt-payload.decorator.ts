import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export const WsJwtPayload = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<Socket>();

    return client.data.user;
  }
);
