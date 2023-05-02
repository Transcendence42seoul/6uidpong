import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateTwoFactorAuthDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsBoolean()
  @IsNotEmpty()
  is2FA: boolean;
}
