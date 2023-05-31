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
    const primaryKey = {
      channelId,
      userId,
    };
    try {
      const mute: Mute = await this.muteRepository.findOneByOrFail(primaryKey);
      if (mute.limitedAt > new Date()) {
        return true;
      }
      await this.muteRepository.delete(primaryKey);
    } catch {}
    return false;
  }

  @Cron("0 * * * *")
  async deleteTimeoutUsers(): Promise<void> {
    await this.muteRepository.delete({
      limitedAt: LessThanOrEqual(new Date()),
    });
  }
}
