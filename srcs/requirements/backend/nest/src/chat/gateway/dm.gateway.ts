import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { RoomResponse } from "../dto/dm/room-response";
import { WsJwtAccessGuard } from "../guard/ws-jwt-access.guard";
import { DmService } from "../service/dm/dm.service";
import { WsJwtPayload } from "../utils/decorator/ws-jwt-payload.decorator";
import { JwtPayload } from "jsonwebtoken";
import { JoinResponse } from "../dto/dm/join-response";
import { BlockService } from "../service/dm/block.service";
import { Block } from "../entity/dm/block.entity";
import { BlockResponse } from "../dto/dm/block-response";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: {
    origin: [`https://${process.env.HOST_NAME}`],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe())
@UseGuards(WsJwtAccessGuard)
export class DmGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(
    private readonly dmService: DmService,
    private readonly blockService: BlockService
  ) {}

  @SubscribeMessage("find-rooms")
  async findRooms(@WsJwtPayload() jwt: JwtPayload): Promise<RoomResponse[]> {
    return await this.dmService.findRooms(jwt.id);
  }

  @SubscribeMessage("join-dm")
  async join(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<JoinResponse> {
    return await this.dmService.join(jwt.id, interlocutorId, client);
  }

  @SubscribeMessage("send-dm")
  async send(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("to") to: { id: number; message: string }
  ): Promise<void> {
    if (await this.blockService.has(jwt.id, to.id)) {
      throw new WsException("can't send because blocked");
    }
    await this.dmService.send(jwt.id, to.id, to.message, client, this.server);
  }

  @SubscribeMessage("leave-dm")
  async leave(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number
  ): Promise<void> {
    client.leave("d" + roomId);
  }

  @SubscribeMessage("delete-room")
  async deleteRoom(
    @WsJwtPayload() jwt: JwtPayload,
    @ConnectedSocket() client: Socket,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.dmService.deleteRoom(jwt.id, interlocutorId, client);
  }

  @SubscribeMessage("find-block-users")
  async findBlockUsers(
    @WsJwtPayload() jwt: JwtPayload
  ): Promise<BlockResponse[]> {
    const blocks: Block[] = await this.blockService.find(jwt.id);
    return blocks.map((block) => new BlockResponse(block));
  }

  @SubscribeMessage("block")
  async block(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.block(jwt.id, interlocutorId);
  }

  @SubscribeMessage("unblock")
  async unblock(
    @WsJwtPayload() jwt: JwtPayload,
    @MessageBody("interlocutorId") interlocutorId: number
  ): Promise<void> {
    await this.blockService.delete(jwt.id, interlocutorId);
  }
}
