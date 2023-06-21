import { Block } from "src/chat/entity/dm/block.entity";

export class BlockResponse {
  constructor(entity: Block) {
    this.id = entity.blockedUser.id;
    this.nickname = entity.blockedUser.nickname;
    this.image = entity.blockedUser.image;
  }

  readonly id: number;

  readonly nickname: string;

  readonly image: string;
}
