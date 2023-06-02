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

  async verifySend(channelId: number, userId: number): Promise<void> {
    const primaryKey = {
      channelId,
      userId,
    };
    const mute: Mute = await this.muteRepository.findOneBy(primaryKey);
    if (!mute) {
      return;
    }
    if (mute.limitedAt > new Date()) {
      throw new WsException("can't send because muted user.");
    }
    await this.muteRepository.delete(primaryKey);
  }

  @Cron("0 * * * *")
  async deleteTimeoutUsers(): Promise<void> {
    await this.muteRepository.delete({
      limitedAt: LessThanOrEqual(new Date()),
    });
  }
}
