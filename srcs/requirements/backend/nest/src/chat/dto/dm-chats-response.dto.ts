import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmChatResponseDto } from "./dm-chat-response.dto";

export class DmChatsResponseDto {
  constructor(roomId: number, newMsgCount: number, entities: DmChatEntity[]) {
    this.roomId = roomId;
    this.newMsgCount = newMsgCount;
    this.chats = entities.map((entity) => {
      return new DmChatResponseDto(entity);
    });
  }
  readonly roomId: number;

  readonly newMsgCount: number;

  readonly chats: DmChatResponseDto[];
}
