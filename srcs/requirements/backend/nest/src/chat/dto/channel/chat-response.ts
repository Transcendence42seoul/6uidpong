import { ChannelChat } from "src/chat/entity/channel/chat.entity";

export class ChatResponse {
  constructor(entity: ChannelChat) {
    this.userId = entity.user.id;
    this.nickname = entity.user.nickname;
    this.image = entity.user.image;
    this.message = entity.message;
    this.createdAt = entity.createdAt;
  }
  readonly userId: number;

  readonly nickname: string;

  readonly image: string;

  readonly message: string;

  readonly createdAt: Date;
}
