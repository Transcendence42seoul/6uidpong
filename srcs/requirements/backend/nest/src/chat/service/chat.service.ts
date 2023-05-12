import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository, SelectQueryBuilder, MoreThanOrEqual } from "typeorm";
import { DmBlocklistEntity } from "../entity/dm-blocklist.entity";
import { DmChatEntity } from "../entity/dm-chat.entity";
import { DmRoomUserEntity } from "../entity/dm-room-user.entity";
import { DmRoomEntity } from "../entity/dm-room.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DmRoomEntity)
    private readonly dmRoomRepository: Repository<DmRoomEntity>,
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
    const scalarSubQuery = this.dmRoomUserRepository
      .createQueryBuilder()
      .select("has_new_msg")
      .where("user_id = :userId")
      .andWhere("room_id = dm_chats.room_id")
      .setParameter("userId", userId)
      .getQuery();

    const queryBuilder = this.dmChatRepository
      .createQueryBuilder("dm_chats")
      .select([
        'dm_chats.room_id       AS "roomId"',
        'dm_chats.message       AS "lastMessage"',
        'dm_chats.created_at    AS "lastMessageTime"',
        'users.id               AS "interlocutorId"',
        "users.nickname         AS interlocutor",
        'users.image            AS "interlocutorImage"',
        `CASE WHEN (${scalarSubQuery})
              THEN 'true'
              ELSE 'false' END  AS "hasNewMsg"`,
      ])
      .innerJoin(
        (inlineViewBuilder: SelectQueryBuilder<DmChatEntity>) =>
          inlineViewBuilder
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

  async findRoomUser(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUserEntity | null> {
    const queryBuilder = this.dmRoomUserRepository
      .createQueryBuilder("room_user")
      .select()
      .innerJoin(
        (inlineViewBuilder) =>
          inlineViewBuilder
            .select("d.room_id")
            .from(DmRoomUserEntity, "d")
            .where("d.user_id IN (:userId, :interlocutorId)")
            .setParameters({ userId, interlocutorId })
            .groupBy("d.room_id")
            .having("COUNT(DISTINCT d.user_id) = 2"),
        "match_room_user",
        "room_user.room_id = match_room_user.room_id"
      )
      .where("room_user.user_id = :userId", { userId });

    return await queryBuilder.getOne();
  }

  async updateEnterInfo(roomUser: DmRoomUserEntity): Promise<any> {
    await this.dmRoomUserRepository.update(roomUser.id, {
      isExit: false,
      createdAt: new Date(),
    });
  }

  async createRoomInfo(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUserEntity> {
    const room: DmRoomEntity = await this.dmRoomRepository.save(
      new DmRoomEntity()
    );
    const roomUsers: DmRoomUserEntity[] = await this.dmRoomUserRepository.save([
      {
        roomId: room.id,
        userId: userId,
      },
      {
        roomId: room.id,
        userId: interlocutorId,
      },
    ]);

    return roomUsers.find((roomUser) => roomUser.user.id === userId);
  }

  async findDmChats(roomUser: DmRoomUserEntity): Promise<DmChatEntity[]> {
    return await this.dmChatRepository.find({
      relations: {
        user: true,
      },
      where: {
        roomId: roomUser.roomId,
        createdAt: MoreThanOrEqual(roomUser.createdAt),
      },
    });
  }

  async isBlocked(userId: number, validateId: number): Promise<boolean> {
    return (await this.dmBlocklistRepository.countBy({
      userId: userId,
      blockedUserid: validateId,
    }))
      ? true
      : false;
  }

  async saveDM(
    userId: number,
    roomId: number,
    message: string
  ): Promise<DmChatEntity> {
    return await this.dmChatRepository.save({
      user: {
        id: userId,
      },
      roomId,
      message,
    });
  }

  async updateHasNewMsg(
    roomId: number,
    userId: number,
    hasNewMsg: boolean
  ): Promise<void> {
    const findOptions = { roomId, user: { id: userId } };
    await this.dmRoomUserRepository.update(findOptions, {
      hasNewMsg,
    });
  }
}
