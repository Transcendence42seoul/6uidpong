import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmUserEntity } from "../entity/dm-user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DmUserEntity)
    private readonly dmUserRepository: Repository<DmUserEntity>,
    @InjectRepository(DmChatEntity)
    private readonly dmChatRepository: Repository<DmChatEntity>
  ) {}

  async findDmRooms(userId: number): Promise<DmUserEntity[]> {
    return await this.dmUserRepository.findBy({
      userId: userId,
      isExit: false,
    });
  }

  async findDmList(userId: number): Promise<Object[]> {
    const queryBuilder = this.dmChatRepository
      .createQueryBuilder("last_chats")
      .select([
        "last_chats.room_id",
        "last_chats.message AS last_message",
        "last_chats.created_at AS last_message_time",
        "u.nickname",
        "u.image",
      ])
      .innerJoin(
        (subQueryBuilder: SelectQueryBuilder<DmChatEntity>) =>
          subQueryBuilder
            .select("dc.room_id", "room_id")
            .addSelect("MAX(dc.created_at)", "max_created_at")
            .from(DmChatEntity, "dc")
            .innerJoin(
              DmUserEntity,
              "du",
              "du.user_id = :userId AND du.is_exit = false AND du.room_id = dc.room_id AND du.created_at <= dc.created_at",
              { userId }
            )
            .groupBy("dc.room_id"),
        "last_dms",
        "last_chats.room_id = last_dms.room_id AND last_chats.created_at = last_dms.max_created_at"
      )
      .innerJoin(
        DmUserEntity,
        "du",
        "last_chats.room_id = du.room_id AND du.user_id != :userId",
        { userId }
      )
      .innerJoin(UserEntity, "u", "du.user_id = u.id")
      .orderBy("last_chats.created_at", "DESC");

    return await queryBuilder.getRawMany();
  }
}
