import { IsNotEmpty, IsString } from "class-validator";

export class UpdateImageDto {
  @IsString()
  @IsNotEmpty()
  readonly image: string;
}
