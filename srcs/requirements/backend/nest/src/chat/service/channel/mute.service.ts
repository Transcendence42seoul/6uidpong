import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Mute } from "src/chat/entity/channel/mute.entity";
import { LessThanOrEqual, Repository } from "typeorm";

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(Mute)
    private readonly muteRepository: Repository<Mute>
  ) {}

  async has(channelId: number, userId: number): Promise<boolean> {
    return (await this.muteRepository.countBy({ channelId, userId }))
      ? true
      : false;
  }

  async mute(
    channelId: number,
    userId: number,
    limitedAt: Date
  ): Promise<void> {
    await this.muteRepository.insert({ channelId, userId, limitedAt });
  }

  @Cron("0 * * * *")
  async deleteTimeoutUsers(): Promise<void> {
    await this.muteRepository.delete({
      limitedAt: LessThanOrEqual(new Date()),
    });
  }
}
