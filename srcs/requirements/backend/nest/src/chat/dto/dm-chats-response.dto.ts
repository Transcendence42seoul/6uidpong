import { DmChatEntity } from "../entity/dm-chat.entity";

export class DmChatResponseDto {
  constructor(dmChatEntity: DmChatEntity) {
    this.userId = dmChatEntity.user.id;
    this.nickname = dmChatEntity.user.nickname;
    this.image = dmChatEntity.user.image;
    this.message = dmChatEntity.message;
    this.createdAt = dmChatEntity.createdAt;
  }

  userId: number;

  nickname: string;

  image: string;

  message: string;

  createdAt: Date;
}
