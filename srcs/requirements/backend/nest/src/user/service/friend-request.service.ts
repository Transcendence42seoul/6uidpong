import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlockService } from "src/chat/service/dm/block.service";
import { Repository } from "typeorm";
import { FriendRequest } from "../entity/friend-request.entity";
import { Friend } from "../entity/friend.entity";
import { FriendService } from "./friend.service";

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly friendService: FriendService,
    private readonly blockService: BlockService
  ) {}

  async find(userId: number): Promise<FriendRequest[]> {
    return await this.friendRequestRepository.find({
      relations: {
        from: true,
      },
      where: {
        toId: userId,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async insert(fromId: number, toId: number): Promise<FriendRequest> {
    await this.blockService.verify(fromId, toId);
    const friend: Friend = await this.friendService.findOne(fromId, toId);
    if (friend) {
      throw new ConflictException();
    }
    await this.friendRequestRepository.insert({
      fromId,
      toId,
    });
    return await this.friendRequestRepository.findOneBy({ fromId, toId });
  }

  async delete(fromId: number, toId: number): Promise<void> {
    await this.friendRequestRepository.delete({
      fromId,
      toId,
    });
  }
}
