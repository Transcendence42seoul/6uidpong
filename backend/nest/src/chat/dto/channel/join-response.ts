import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChatResponse } from "./chat-response";

export class JoinResponse {
  constructor(channelId: number, newMsgCount: number, entities: ChannelChat[]) {
    this.channelId = channelId;
    this.newMsgCount = newMsgCount;
    this.chats = entities.map((entity) => new ChatResponse(entity));
  }
  readonly channelId: number;

  readonly newMsgCount: number;

  readonly chats: ChatResponse[];
}
