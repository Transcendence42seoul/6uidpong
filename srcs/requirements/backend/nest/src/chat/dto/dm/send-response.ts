import { DmChat } from "../../entity/dm/dm-chat.entity";
import { ChatResponse } from "./chat-response";

export class SendResponse {
  constructor(roomId: number, chat: DmChat) {
    this.roomId = roomId;
    this.chatResponse = new ChatResponse(chat);
  }

  readonly roomId: number;

  readonly chatResponse: ChatResponse;
}
