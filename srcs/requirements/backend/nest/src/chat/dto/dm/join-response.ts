import { DmChat } from "../../entity/dm/dm-chat.entity";
import { ChatResponse } from "./chat-response";

export class JoinResponse {
  constructor(
    roomId: number,
    newMsgCount: number,
    isBlocked: boolean,
    entities: DmChat[]
  ) {
    this.roomId = roomId;
    this.newMsgCount = newMsgCount;
    this.isBlocked = isBlocked;
    this.chats = entities.map((entity) => new ChatResponse(entity));
  }
  readonly roomId: number;

  readonly newMsgCount: number;

  readonly isBlocked: boolean;

  readonly chats: ChatResponse[];
}
