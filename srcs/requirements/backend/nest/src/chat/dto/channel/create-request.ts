import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class CreateRequest {
  @IsNotEmpty()
  @IsString()
  @Length(4, 30)
  @Matches(/^[a-zA-Z0-9!@#$%^&*()]+$/)
  readonly title: string;

  readonly password: string | undefined;

  @IsNotEmpty()
  @IsBoolean()
  readonly isPublic: boolean;
}
