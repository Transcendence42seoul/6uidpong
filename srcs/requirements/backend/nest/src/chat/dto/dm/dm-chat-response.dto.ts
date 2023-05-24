import { DmChat } from "../../entity/dm/dm-chat.entity";

export class DmChatResponse {
  constructor(entity: DmChat) {
    this.id = entity.id;
    this.roomId = entity.room.id;
    this.userId = entity.user.id;
    this.nickname = entity.user.nickname;
    this.image = entity.user.image;
    this.message = entity.message;
    this.createdAt = entity.createdAt;
  }

  readonly id: number;

  readonly roomId: number;

  readonly userId: number;

  readonly nickname: string;

  readonly image: string;

  readonly message: string;

  readonly createdAt: Date;
}
