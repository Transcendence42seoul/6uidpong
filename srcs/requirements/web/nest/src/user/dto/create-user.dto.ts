import { UserEntity } from "../user.entity";

export class CreateUserDto {
  constructor(id: number, profileImage: string) {
    this.id = id;
    this.nickname = `undefined-${id}`;
    this.profileImage = profileImage;
  }

  id: number;
  nickname: string;
  profileImage: string;

  toEntity(): UserEntity {
    return new UserEntity(this.id, this.nickname, this.profileImage)
  }
}
