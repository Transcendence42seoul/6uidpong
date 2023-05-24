import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateTwoFactorAuthRequest {
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly is2FA: boolean;
}
