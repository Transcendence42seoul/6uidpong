import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";

export class UserResponse {
  constructor(entity: ChannelUser) {
    this.id = entity.user.id;
    this.nickname = entity.user.nickname;
    this.image = entity.user.image;
    this.status = entity.user.status;
    this.isOwner = entity.isOwner;
    this.isAdmin = entity.isAdmin;
  }

  readonly id: number;

  readonly nickname: string;

  readonly image: string;

  readonly status: string;

  readonly isOwner: boolean;

  readonly isAdmin: boolean;
}
