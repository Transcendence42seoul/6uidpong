import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class ChannelCreateRequest {
  @IsNotEmpty()
  @IsString()
  @Length(4, 30)
  @Matches(/^[a-zA-Z0-9]+$/)
  readonly title: string;

  @IsString()
  @Length(0, 30)
  readonly password: string | undefined;

  @IsNotEmpty()
  @IsBoolean()
  readonly isPublic: boolean;
}
