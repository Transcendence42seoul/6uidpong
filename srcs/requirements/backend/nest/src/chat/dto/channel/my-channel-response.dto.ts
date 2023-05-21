import { ChannelUserEntity } from "src/chat/entity/channel/channel-user.entity";

export class MyChannelResponseDto {
  constructor(entity: ChannelUserEntity) {
    this.id = entity.channel.id;
    this.title = entity.channel.title;
    this.isPublic = entity.channel.isPublic;
    this.newMsgCount = entity.newMsgCount;
  }
  id: number;

  title: string;

  isPublic: boolean;

  newMsgCount: number;
}
