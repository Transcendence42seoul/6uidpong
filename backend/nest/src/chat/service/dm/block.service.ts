import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { Repository } from "typeorm";
import { Block } from "../../entity/dm/block.entity";

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>
  ) {}

  async find(userId: number): Promise<Block[]> {
    return await this.blockRepository.find({
      relations: {
        blockedUser: true,
      },
      where: {
        userId,
      },
      order: {
        blockedUser: {
          nickname: "ASC",
        },
      },
    });
  }

  async findOne(userId: number, blockedUserId: number): Promise<Block> {
    return await this.blockRepository.findOneBy({
      userId,
      blockedUserId,
    });
  }

  async isBlocked(user1Id: number, user2Id: number): Promise<boolean> {
    return await this.blockRepository.countBy([
      { userId: user1Id, blockedUserId: user2Id }, 
      { userId: user2Id, blockedUserId: user1Id }
    ]) ? true : false;
  }

  async delete(userId: number, interlocutorId: number): Promise<void> {
    await this.blockRepository.delete({
      userId: userId,
      blockedUserId: interlocutorId,
    });
  }

  async verify(userId: number, interlocutorId: number): Promise<void> {
    if (
      await this.blockRepository.countBy([
        {
          userId: interlocutorId,
          blockedUserId: userId,
        },
        {
          userId,
          blockedUserId: interlocutorId,
        },
      ])
    ) {
      throw new WsException("can't send because blocked.");
    }
  }
}
