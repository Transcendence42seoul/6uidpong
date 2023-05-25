import { Channel } from "src/chat/entity/channel/channel.entity";

export class ChannelCreateResponse {
  constructor(entity: Channel) {
    this.id = entity.id;
  }
  readonly id: number;
}
