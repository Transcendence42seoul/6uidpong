import { IsString } from "class-validator";

export class UpdateImageDto {
  @IsString()
  readonly image: string;
}
