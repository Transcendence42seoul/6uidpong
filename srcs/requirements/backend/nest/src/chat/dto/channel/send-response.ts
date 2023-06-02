import { ChatResponse } from "./chat-response";

export class SendResponse {
  constructor(channelId: number, chatResponse: ChatResponse) {
    this.channelId = channelId;
    this.chatResponse = chatResponse;
  }

  readonly channelId: number;

  readonly chatResponse: ChatResponse;
}
