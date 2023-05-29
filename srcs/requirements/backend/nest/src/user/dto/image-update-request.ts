import { IsNotEmpty, IsString } from "class-validator";

export class ImageUpdateRequest {
  @IsString()
  @IsNotEmpty()
  readonly image: string;
}
