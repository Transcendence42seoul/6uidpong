import { UserEntity } from "../user.entity";

export class UserDto {
  constructor(user: UserEntity) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.email = user.email;
    this.profileImage = user.profileImage;
    this.isTwoFactor = user.isTwoFactor;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.lastLoginAt = user.lastLoginAt;
  }

  id: number;
  nickname: string;
  email: string;
  profileImage: string;
  isTwoFactor: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
