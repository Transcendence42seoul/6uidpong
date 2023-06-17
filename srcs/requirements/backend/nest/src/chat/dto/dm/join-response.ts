import { DmChat } from "../../entity/dm/dm-chat.entity";
import { ChatResponse } from "./chat-response";

export class JoinResponse {
  constructor(
    interlocutorId: number,
    newMsgCount: number,
    isBlocked: boolean,
    entities: DmChat[]
  ) {
    this.interlocutorId = interlocutorId;
    this.newMsgCount = newMsgCount;
    this.isBlocked = isBlocked;
    this.chats = entities.map((entity) => new ChatResponse(entity));
  }
  readonly interlocutorId: number;

  readonly newMsgCount: number;

  readonly isBlocked: boolean;

  readonly chats: ChatResponse[];
}
