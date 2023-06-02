import { Injectable } from "@nestjs/common";
import { Namespace } from "socket.io";
import { SendResponse } from "src/chat/dto/channel/send-response";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { EntityManager, InsertResult } from "typeorm";

@Injectable()
export class ChannelSystemService {
  constructor() {}

  async send(
    manager: EntityManager,
    userId: number,
    channelId: number,
    message: string,
    server: Namespace
  ): Promise<void> {
    const sockets = await server.in("c" + channelId).fetchSockets();
    const channelUsers: ChannelUser[] = await manager.find(ChannelUser, {
      relations: {
        user: true,
      },
      where: {
        channelId,
      },
    });
    const notJoined = channelUsers
      .filter(
        (channelUser) =>
          !sockets.some((socket) => socket.id === channelUser.user.socketId)
      )
      .map((notJoinedUser) => ({ channelId, userId: notJoinedUser.user.id }));
    const onlineSockets: string[] = channelUsers
      .filter((channelUser) => channelUser.user.status === "online")
      .map((onlineChannelUser) => onlineChannelUser.user.socketId);
    const { identifiers }: InsertResult = await manager.insert(ChannelChat, {
      user: {
        id: userId,
      },
      channel: {
        id: channelId,
      },
      message,
      isSystem: true,
    });
    if (notJoined.length > 0) {
      await manager.increment(ChannelUser, notJoined, "newMsgCount", 1);
    }

    const chat: ChannelChat = await manager.findOne(ChannelChat, {
      relations: {
        user: true,
      },
      where: {
        id: identifiers[0].id,
      },
    });
    server
      .to(onlineSockets)
      .emit("send-channel", new SendResponse(channelId, chat));
  }
}
