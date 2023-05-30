import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendRequest } from "../entity/friend-request.entity";

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>
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
