import { User } from "../entity/user.entity";

export class UserResponseDto {
  constructor(entity: User) {
    this.id = entity.id;
    this.nickname = entity.nickname;
    this.email = entity.email;
    this.image = entity.image;
    this.is2FA = entity.is2FA;
    this.status = entity.status;
    this.winStat = entity.winStat;
    this.loseStat = entity.loseStat;
    this.ladderScore = entity.ladderScore;
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
}
