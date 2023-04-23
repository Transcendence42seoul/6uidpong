import { IsNotEmpty, IsEmail, IsUrl } from "class-validator";
import { UserEntity } from "../user.entity";

export class CreateUserDto {
  constructor(id: number, email: string, profileImage: string) {
    this.id = id;
    this.email = email;
    this.profileImage = profileImage;
  }

  @IsNotEmpty()
  id: number;

  nickname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUrl()
  profileImage: string;

  toEntity(): UserEntity {
    return new UserEntity(this.id, this.email, this.profileImage);
  }
}
