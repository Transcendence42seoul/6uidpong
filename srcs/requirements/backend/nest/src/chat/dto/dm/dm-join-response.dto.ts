import { DmChat } from "../../entity/dm/dm-chat.entity";
import { DmChatResponse } from "./dm-chat-response.dto";

export class DmJoinResponse {
  constructor(roomId: number, newMsgCount: number, entities: DmChat[]) {
    this.roomId = roomId;
    this.newMsgCount = newMsgCount;
    this.chats = entities.map((entity) => new DmChatResponse(entity));
  }
  readonly roomId: number;

  readonly newMsgCount: number;

  readonly chats: DmChatResponse[];
}
