import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendRequestEntity } from "../entity/friend-request.entity";

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>
  ) {}

  async find(userId: number): Promise<FriendRequestEntity[]> {
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

  async create(fromId: number, toId: number): Promise<FriendRequestEntity> {
    return await this.friendRequestRepository.save({
      fromId,
      toId,
    });
  }

  async delete(fromId: number, toId: number): Promise<void> {
    await this.friendRequestRepository.delete({
      fromId,
      toId,
    });
  }
}
