import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ban } from "src/chat/entity/channel/ban.entity";
import { Repository } from "typeorm";

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(Ban)
    private readonly banRepository: Repository<Ban>
  ) {}

  async find(channelId: number): Promise<Ban[]> {
    return await this.banRepository.find({
      relations: {
        user: true,
      },
      where: {
        channelId,
      },
      order: {
        user: {
          nickname: "ASC",
        },
      },
    });
  }

  async includes(channelId: number, userIds: number[]): Promise<boolean> {
    const primaryKeys = userIds.map((userId) => ({ channelId, userId }));
    const results: Ban[] = await this.banRepository.findBy(primaryKeys);
    return results.length > 0 ? true : false;
  }

  async delete(channelId: number, userId: number): Promise<void> {
    await this.banRepository.delete({ channelId, userId });
  }
}
