import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChatResponse } from "./chat-response";

export class SystemResponse {
  constructor(channelId: number, chat: ChannelChat, channelUsers: ChannelUser[]) {
    this.channelId = channelId;
    this.chatResponse = new ChatResponse(chat);
    this.channelUsers = channelUsers;
  }

  readonly channelId: number;

  readonly chatResponse: ChatResponse;

  readonly channelUsers: ChannelUser[];
}
