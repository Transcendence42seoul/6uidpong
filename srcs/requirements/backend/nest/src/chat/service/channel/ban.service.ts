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

  async findUsers(channelId: number): Promise<Ban[]> {
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

  async has(channelId: number, userId: number): Promise<boolean> {
    const primaryKey = { channelId, userId };
    const ban: Ban = await this.banRepository.findOneBy(primaryKey);
    if (ban) {
      return true;
    }
    return false;
  }

  async delete(channelId: number, userId: number): Promise<void> {
    await this.banRepository.delete({ channelId, userId });
  }
}
