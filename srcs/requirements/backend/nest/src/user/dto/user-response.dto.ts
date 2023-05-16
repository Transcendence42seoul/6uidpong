import { UserEntity } from "../entity/user.entity";

export class UserResponseDto {
  constructor(entity: UserEntity) {
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
  id: number;

  nickname: string;

  email: string;

  image: string;

  is2FA: boolean;

  status: string;

  winStat: number;

  loseStat: number;

  ladderScore: number;
}
