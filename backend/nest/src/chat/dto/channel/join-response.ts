import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChatResponse } from "./chat-response";
import { UserResponse } from "./user-response";

export class JoinResponse {
  constructor(channelId: number, newMsgCount: number, entities: ChannelChat[], channelUsers: UserResponse[]) {
    this.channelId = channelId;
    this.newMsgCount = newMsgCount;
    this.chats = entities.map((entity) => new ChatResponse(entity));
    this.channelUsers = channelUsers;
  }
  readonly channelId: number;

  readonly newMsgCount: number;

  readonly chats: ChatResponse[];

  readonly channelUsers: UserResponse[];
}
