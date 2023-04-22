import { IsNotEmpty, IsEmail, IsUrl } from "class-validator";
import { UserEntity } from "../user.entity";
import { v4 as uuidv4 } from "uuid";

export class CreateUserDto {
  constructor(id: number, email: string, profileImage: string) {
    this.id = id;
    this.nickname = uuidv4();
    this.email = email;
    this.profileImage = profileImage;
  }

  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUrl()
  profileImage: string;

  toEntity(): UserEntity {
    return new UserEntity(
      this.id,
      this.nickname,
      this.email,
      this.profileImage
    );
  }
}
