import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class TwoFactorAuthRequest {
  @IsNotEmpty()
  @IsInt()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly code: string;
}
