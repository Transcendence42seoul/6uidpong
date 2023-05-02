import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class TwoFactorAuthDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  code: string;
}
