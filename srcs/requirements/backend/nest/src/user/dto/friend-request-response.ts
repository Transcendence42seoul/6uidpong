import { FriendRequest } from "../entity/friend-request.entity";

export class FriendRequestResponse {
  constructor(entity: FriendRequest) {
    this.id = entity.from.id;
    this.nickname = entity.from.nickname;
    this.image = entity.from.image;
  }
  readonly id: number;

  readonly nickname: string;

  readonly image: string;
}
