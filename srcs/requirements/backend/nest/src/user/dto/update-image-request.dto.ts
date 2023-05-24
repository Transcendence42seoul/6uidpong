import { IsNotEmpty, IsString } from "class-validator";

export class UpdateImageRequest {
  @IsString()
  @IsNotEmpty()
  readonly image: string;
}
