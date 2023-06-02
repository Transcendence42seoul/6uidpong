import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChatResponse } from "./chat-response";

export class SendResponse {
  constructor(channelId: number, chat: ChannelChat) {
    this.channelId = channelId;
    this.chatResponse = new ChatResponse(chat);
  }

  readonly channelId: number;

  readonly chatResponse: ChatResponse;
}
