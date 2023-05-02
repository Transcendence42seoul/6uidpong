import { IsString, Length, Matches } from "class-validator";

export class UpdateNicknameDto {
  @IsString()
  @Length(4, 14)
  @Matches(/^[a-zA-Z0-9]+$/)
  nickname: string;
}
