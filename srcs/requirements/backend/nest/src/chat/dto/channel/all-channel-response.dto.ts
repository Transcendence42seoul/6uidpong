import { ChannelEntity } from "src/chat/entity/channel/channel.entity";

export class AllChannelResponseDto {
  constructor(entity: ChannelEntity) {
    this.id = entity.id;
    this.title = entity.title;
    this.isPublic = entity.isPublic;
  }
  id: number;

  title: string;

  isPublic: boolean;
}
