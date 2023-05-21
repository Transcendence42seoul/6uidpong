import { DmChatEntity } from "../../entity/dm/dm-chat.entity";

export class DmChatResponseDto {
  constructor(entity: DmChatEntity) {
    this.id = entity.id;
    this.roomId = entity.room.id;
    this.userId = entity.user.id;
    this.nickname = entity.user.nickname;
    this.image = entity.user.image;
    this.message = entity.message;
    this.createdAt = entity.createdAt;
  }

  id: number;

  roomId: number;

  userId: number;

  nickname: string;

  image: string;

  message: string;

  createdAt: Date;
}
