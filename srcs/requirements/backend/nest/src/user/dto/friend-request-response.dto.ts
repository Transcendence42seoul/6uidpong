import { FriendRequestEntity } from "../entity/friend-request.entity";

export class FriendRequestResponseDto {
  constructor(entity: FriendRequestEntity) {
    this.id = entity.from.id;
    this.nickname = entity.from.nickname;
  }
  id: number;

  nickname: string;
}
