import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { Mute } from "src/chat/entity/channel/mute.entity";
import { LessThanOrEqual, Repository } from "typeorm";

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(Mute)
    private readonly muteRepository: Repository<Mute>
  ) {}

  async validate(channelId: number, userId: number): Promise<void> {
    const pk: Object = {
      channelId,
      userId,
    };
    const mute: Mute | null = await this.muteRepository.findOneBy(pk);
    if (mute) {
      if (mute.limitedAt > new Date()) {
        throw new WsException("can't send because muted user.");
      }
      await this.muteRepository.delete(pk);
    }
  }

  async mute(
    channelId: number,
    userId: number,
    limitedAt: Date
  ): Promise<void> {
    await this.muteRepository.upsert({ channelId, userId, limitedAt }, [
      "channelId",
      "userId",
    ]);
  }

  @Cron("0 * * * *")
  async deleteTimeoutUsers(): Promise<void> {
    await this.muteRepository.delete({
      limitedAt: LessThanOrEqual(new Date()),
    });
  }
}
