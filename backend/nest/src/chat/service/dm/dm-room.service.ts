import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoomResponse } from "src/chat/dto/dm/room-response";
import { DmChat } from "src/chat/entity/dm/dm-chat.entity";
import { DmUser } from "src/chat/entity/dm/dm-room-user.entity";
import { DmRoom } from "src/chat/entity/dm/dm-room.entity";
import { User } from "src/user/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class DmRoomService {
  constructor(
    @InjectRepository(DmRoom)
    private readonly roomRepository: Repository<DmRoom>,
    @InjectRepository(DmChat)
    private readonly chatRepository: Repository<DmChat>
  ) {}

  async find(userId: number): Promise<RoomResponse[]> {
    return await this.chatRepository
      .createQueryBuilder("dm_chats")
      .select([
        'dm_chats.room_id       AS "roomId"',
        'dm_chats.message       AS "lastMessage"',
        'dm_chats.created_at    AS "lastMessageTime"',
        'users.id               AS "interlocutorId"',
        "users.nickname         AS interlocutor",
        'users.image            AS "interlocutorImage"',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select("sub.new_msg_count")
            .from(DmUser, "sub")
            .where("sub.user_id = :userId")
            .andWhere("sub.room_id = dm_chats.room_id"),
        "newMsgCount"
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("sub_dm_chats.room_id", "room_id")
            .addSelect("MAX(sub_dm_chats.created_at)", "max_created_at")
            .from(DmChat, "sub_dm_chats")
            .innerJoin(
              DmUser,
              "room_users",
              "room_users.user_id = :userId AND room_users.is_exit = false AND room_users.room_id = sub_dm_chats.room_id"
            )
            .groupBy("sub_dm_chats.room_id"),
        "last_chats",
        "dm_chats.room_id = last_chats.room_id AND dm_chats.created_at = last_chats.max_created_at"
      )
      .innerJoin(
        DmUser,
        "room_users",
        "dm_chats.room_id = room_users.room_id AND room_users.user_id != :userId"
      )
      .innerJoin(User, "users", "room_users.user_id = users.id")
      .orderBy("dm_chats.created_at", "DESC")
      .setParameter("userId", userId)
      .getRawMany();
  }

  async delete(id: number): Promise<void> {
    await this.roomRepository.delete(id);
  }
}
