import { Ban } from "src/chat/entity/channel/ban.entity";

export class BanResponse {
  constructor(entity: Ban) {
    this.id = entity.user.id;
    this.nickname = entity.user.nickname;
    this.image = entity.user.image;
  }

  readonly id: number;

  readonly nickname: string;

  readonly image: string;
}
