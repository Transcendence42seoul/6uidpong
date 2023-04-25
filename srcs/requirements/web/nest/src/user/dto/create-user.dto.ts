import { UserEntity } from "../user.entity";

export class CreateUserDto {
  constructor(id: number, email: string, profileImage: string) {
    this.id = id;
    this.nickname = `unknown-${id}`;
    this.email = email;
    this.profileImage = profileImage;
  }

  id: number;
  nickname: string;
  email: string;
  profileImage: string; 

  toEntity(): UserEntity {
    return new UserEntity(
      this.id,
      this.nickname,
      this.email,
      this.profileImage,
    );
  }
}
