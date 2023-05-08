import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entity/user.entity";
import { getRepository, Repository, SelectQueryBuilder } from "typeorm";
import { DmChatEntity } from "../entity/chat.entity";
import { DmRoomEntity } from "../entity/dm-rooms.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DmChatEntity)
    private readonly dmChatRepository: Repository<DmChatEntity>
  ) {}
  async findDmRoomInfo(userId: number): Promise<Object[]> {
    const queryBuilder: SelectQueryBuilder<DmChatEntity> = getRepository(
      DmChatEntity
    )
      .createQueryBuilder("c")
      .select(["c.roomId", "c.content", "u.nickname", "u.image"])
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("room_id")
            .addSelect("MAX(created_at)", "max_created_at")
            .from(DmChatEntity, "m")
            .where("sender = :userId OR recipient = :userId")
            .groupBy("room_id"),
        "m",
        "c.room_id = m.room_id AND c.created_at = m.max_created_at"
      )
      .innerJoin(
        UserEntity,
        "u",
        "u.user_id = CASE WHEN c.sender = :userId THEN c.recipient WHEN c.recipient = :userId THEN c.sender END"
      )
      .innerJoin(DmRoomEntity, "r", "d.room_id = r.room_id")
      .orderBy("r.createAt", "DESC");

    return await queryBuilder.setParameter("userId", userId).getRawMany();
  }

  async findDmChats(roomId: number, userId: number): Promise<DmChatEntity[]> {
    return await this.dmChatRepository.findBy([
      { roomId: roomId, sender: userId },
      { roomId: roomId, recipient: userId },
    ]);
  }
}
