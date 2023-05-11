import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository, SelectQueryBuilder, MoreThanOrEqual } from "typeorm";
import { DmBlocklistEntity } from "../entity/dm-blocklist.entity";
import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmRoomUserEntity } from "../entity/dm-room-user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DmRoomUserEntity)
    private readonly dmRoomUserRepository: Repository<DmRoomUserEntity>,
    @InjectRepository(DmChatEntity)
    private readonly dmChatRepository: Repository<DmChatEntity>,
    @InjectRepository(DmBlocklistEntity)
    private readonly dmBlocklistRepository: Repository<DmBlocklistEntity>
  ) {}

  async findParticipationRoom(userId: number): Promise<DmRoomUserEntity[]> {
    return await this.dmRoomUserRepository.findBy({
      user: {
        id: userId,
      },
      isExit: false,
    });
  }

  async findDmRooms(userId: number): Promise<Object[]> {
    const queryBuilder = this.dmChatRepository
      .createQueryBuilder("dm_chats")
      .select([
        'dm_chats.room_id     AS "roomId"',
        'dm_chats.message     AS "lastMessage"',
        'dm_chats.created_at  AS "lastMessageTime"',
        "users.nickname       AS interlocutor",
        'users.image          AS "interlocutorImage"',
      ])
      .innerJoin(
        (subQueryBuilder: SelectQueryBuilder<DmChatEntity>) =>
          subQueryBuilder
            .select("sub_dm_chats.room_id", "room_id")
            .addSelect("MAX(sub_dm_chats.created_at)", "max_created_at")
            .from(DmChatEntity, "sub_dm_chats")
            .innerJoin(
              DmRoomUserEntity,
              "room_users",
              "room_users.user_id = :userId AND room_users.is_exit = false AND room_users.room_id = sub_dm_chats.room_id",
              { userId }
            )
            .groupBy("sub_dm_chats.room_id"),
        "last_chats",
        "dm_chats.room_id = last_chats.room_id AND dm_chats.created_at = last_chats.max_created_at"
      )
      .innerJoin(
        DmRoomUserEntity,
        "room_users",
        "dm_chats.room_id = room_users.room_id AND room_users.user_id != :userId",
        { userId }
      )
      .innerJoin(UserEntity, "users", "room_users.user_id = users.id")
      .orderBy("dm_chats.created_at", "DESC");

    return await queryBuilder.getRawMany();
  }

  async findDmChats(userId: number, roomId: number): Promise<DmChatEntity[]> {
    try {
      const roomUserInfo = await this.dmRoomUserRepository.findOneByOrFail({
        user: {
          id: userId,
        },
        roomId,
      });
      return await this.dmChatRepository.find({
        relations: {
          user: true,
        },
        where: {
          roomId,
          createdAt: MoreThanOrEqual(roomUserInfo.createdAt),
        },
      });
    } catch (EntityNotFoundError) {
      throw new WsException("invalid request");
    }
  }

  async isBlocked(userId: number, validateId: number): Promise<boolean> {
    return (await this.dmBlocklistRepository.countBy({
      userId: userId,
      blockedUserid: validateId,
    }))
      ? true
      : false;
  }
}
