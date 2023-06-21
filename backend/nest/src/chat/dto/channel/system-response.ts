import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { ChatResponse } from "./chat-response";
import { UserResponse } from "./user-response";

export class SystemResponse {
  constructor(channelId: number, chat: ChannelChat, channelUsers: UserResponse[]) {
    this.channelId = channelId;
    this.chatResponse = new ChatResponse(chat);
    this.channelUsers = channelUsers;
  }

  readonly channelId: number;

  readonly chatResponse: ChatResponse;

  readonly channelUsers: UserResponse[];
}
