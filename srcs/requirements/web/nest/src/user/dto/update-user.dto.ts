import { IsNotEmpty } from "class-validator";

export class UpdateNicknameDto {
  @IsNotEmpty()
  @Is
  nickname: string;
}
