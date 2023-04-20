import { IsNotEmpty, IsEmail, IsUrl } from "class-validator";
import { UserEntity } from "../user.entity";

export class CreateUserDto {
  constructor(token_id: number, email: string, profile_image: string) {
    this.token_id = token_id;
    this.email = email;
    this.profile_image = profile_image;
  }

  @IsNotEmpty()
  token_id: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUrl()
  profile_image: string;

  toEntity(): UserEntity {
    return new UserEntity(this.token_id, this.email, this.profile_image);
  }
}
