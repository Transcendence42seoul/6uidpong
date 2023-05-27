import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ban } from "src/chat/entity/channel/ban.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(Ban)
    private readonly banRepository: Repository<Ban>,
    private readonly dataSource: DataSource
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
    return (await this.banRepository.countBy({ channelId, userId }))
      ? true
      : false;
  }

  async ban(channelId: number, userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ChannelUser, { channelId, userId });
      await queryRunner.manager.insert(Ban, { channelId, userId });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unban(channelId: number, userId: number): Promise<void> {
    await this.banRepository.delete({ channelId, userId });
  }
}
