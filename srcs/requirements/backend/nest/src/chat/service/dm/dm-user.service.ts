import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DmUser } from "src/chat/entity/dm/dm-room-user.entity";
import { Repository } from "typeorm";

@Injectable()
export class DmUserService {
  constructor(
    @InjectRepository(DmUser)
    private readonly dmUserRepository: Repository<DmUser>
  ) {}

  async findOne(userId: number, interlocutorId: number): Promise<DmUser> {
    return await this.dmUserRepository
      .createQueryBuilder("room_user")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("d.room_id")
            .from(DmUser, "d")
            .where("d.user_id IN (:userId, :interlocutorId)")
            .groupBy("d.room_id")
            .having("COUNT(DISTINCT d.user_id) = 2"),
        "match_room_user",
        "room_user.room_id = match_room_user.room_id"
      )
      .innerJoinAndSelect("room_user.user", "user")
      .where("room_user.user_id = :userId")
      .setParameters({ userId, interlocutorId })
      .getOneOrFail();
  }

  async findOneNotFail(
    userId: number,
    interlocutorId: number
  ): Promise<DmUser> {
    return await this.dmUserRepository
      .createQueryBuilder("room_user")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("d.room_id")
            .from(DmUser, "d")
            .where("d.user_id IN (:userId, :interlocutorId)")
            .groupBy("d.room_id")
            .having("COUNT(DISTINCT d.user_id) = 2"),
        "match_room_user",
        "room_user.room_id = match_room_user.room_id"
      )
      .innerJoinAndSelect("room_user.user", "user")
      .where("room_user.user_id = :userId")
      .setParameters({ userId, interlocutorId })
      .getOne();
  }

  async exit(roomId: number, userId: number): Promise<void> {
    await this.dmUserRepository.update(
      { roomId, userId },
      {
        isExit: true,
        newMsgCount: 0,
      }
    );
  }
}
