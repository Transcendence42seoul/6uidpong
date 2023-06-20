import { User } from "../entity/user.entity";

export class UserProfileResponse {
  constructor(entity: User, isBlocked: boolean, isFriend: boolean, isFriendRequest: boolean) {
    this.id = entity.id;
    this.nickname = entity.nickname;
    this.email = entity.email;
    this.image = entity.image;
    this.is2FA = entity.is2FA;
    this.status = entity.status;
    this.winStat = entity.winStat;
    this.loseStat = entity.loseStat;
    this.ladderScore = entity.ladderScore;
    this.isBlocked = isBlocked;
    this.isFriend = isFriend;
    this.isFriendRequest = isFriendRequest;
  }
  readonly id: number;

  readonly nickname: string;

  readonly email: string;

  readonly image: string;

  readonly is2FA: boolean;

  readonly status: string;

  readonly winStat: number;

  readonly loseStat: number;

  readonly ladderScore: number;

  readonly isBlocked: boolean;

  readonly isFriend: boolean;

  readonly isFriendRequest: boolean;
}
