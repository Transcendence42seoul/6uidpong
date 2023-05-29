import { Friend } from "../entity/friend.entity";

export class FriendResponse {
  constructor(entity: Friend) {
    this.id = entity.friend.id;
    this.nickname = entity.friend.nickname;
    this.image = entity.friend.image;
    this.status = entity.friend.status;
  }
  readonly id: number;

  readonly nickname: string;

  readonly image: string;

  readonly status: string;
}
