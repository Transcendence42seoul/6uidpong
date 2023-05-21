import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entity/user.entity";
import {
  Repository,
  SelectQueryBuilder,
  MoreThanOrEqual,
  DataSource,
} from "typeorm";
import { DmRoomsResponseDto } from "../../dto/dm/dm-rooms-response.dto";
import { DmChatEntity } from "../../entity/dm/dm-chat.entity";
import { DmRoomUserEntity } from "../../entity/dm/dm-room-user.entity";
import { DmRoomEntity } from "../../entity/dm/dm-room.entity";

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DmRoomEntity)
    private readonly roomRepository: Repository<DmRoomEntity>,
    @InjectRepository(DmRoomUserEntity)
    private readonly roomUserRepository: Repository<DmRoomUserEntity>,
    @InjectRepository(DmChatEntity)
    private readonly chatRepository: Repository<DmChatEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findRooms(userId: number): Promise<DmRoomsResponseDto[]> {
    const scalarSubQuery = this.roomUserRepository
      .createQueryBuilder()
      .select("new_msg_count")
      .where("user_id = :userId")
      .andWhere("room_id = dm_chats.room_id")
      .setParameter("userId", userId)
      .getQuery();
    const queryBuilder = this.chatRepository
      .createQueryBuilder("dm_chats")
      .select([
        'dm_chats.room_id       AS "roomId"',
        'dm_chats.message       AS "lastMessage"',
        'dm_chats.created_at    AS "lastMessageTime"',
        'users.id               AS "interlocutorId"',
        "users.nickname         AS interlocutor",
        'users.image            AS "interlocutorImage"',
        `(${scalarSubQuery})    AS "newMsgCount"`,
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

    return await queryBuilder.getRawMany<DmRoomsResponseDto>();
  }

  async findRoomUser(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUserEntity> {
    const queryBuilder = this.roomUserRepository
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

    return await queryBuilder.getOneOrFail();
  }

  async updateRoomUser(roomUser: DmRoomUserEntity): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findOptions: Object = {
        roomId: roomUser.roomId,
        userId: roomUser.userId,
      };
      if (roomUser.isExit) {
        await queryRunner.manager.update(DmRoomUserEntity, findOptions, {
          isExit: false,
          createdAt: new Date(),
        });
      } else if (roomUser.newMsgCount > 0) {
        await queryRunner.manager.update(DmRoomUserEntity, findOptions, {
          newMsgCount: 0,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async saveRoomUsers(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUserEntity> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const saveOptions: Object = {
        transaction: false,
      };
      const newRoom: DmRoomEntity = await queryRunner.manager.save(
        DmRoomEntity,
        new DmRoomEntity(),
        saveOptions
      );
      const newRoomUser: DmRoomUserEntity = await queryRunner.manager.save(
        DmRoomUserEntity,
        {
          roomId: newRoom.id,
          userId: userId,
        },
        saveOptions
      );
      await queryRunner.manager.save(
        DmRoomUserEntity,
        {
          roomId: newRoom.id,
          userId: interlocutorId,
        },
        saveOptions
      );

      await queryRunner.commitTransaction();
      return newRoomUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findChats(roomUser: DmRoomUserEntity): Promise<DmChatEntity[]> {
    return await this.chatRepository.find({
      relations: {
        user: true,
        room: true,
      },
      where: {
        room: {
          id: roomUser.roomId,
        },
        createdAt: MoreThanOrEqual(roomUser.createdAt),
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

  async saveChat(
    senderId: number,
    message: string,
    recipientRoomUser: DmRoomUserEntity,
    isNotJoin: boolean
  ): Promise<DmChatEntity> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newChat: DmChatEntity = await queryRunner.manager.save(
        DmChatEntity,
        {
          user: {
            id: senderId,
          },
          room: {
            id: recipientRoomUser.roomId,
          },
          message,
        },
        { transaction: false }
      );
      if (recipientRoomUser.isExit) {
        await queryRunner.manager.update(
          DmRoomUserEntity,
          {
            userId: recipientRoomUser.userId,
            roomId: recipientRoomUser.roomId,
          },
          {
            isExit: false,
            createdAt: newChat.createdAt,
          }
        );
      }
      if (isNotJoin) {
        await queryRunner.manager.increment(
          DmRoomUserEntity,
          {
            userId: recipientRoomUser.userId,
            roomId: recipientRoomUser.roomId,
          },
          "newMsgCount",
          1
        );
      }

      await queryRunner.commitTransaction();
      return newChat;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findChat(id: number): Promise<DmChatEntity> {
    return await this.chatRepository.findOne({
      relations: {
        user: true,
        room: true,
      },
      where: {
        id: id,
      },
    });
  }

  async deleteRoom(id: number): Promise<void> {
    this.roomRepository.delete(id);
  }

  async exitRoom(roomId: number, userId: number): Promise<void> {
    const findOptions: Object = { roomId, userId };
    await this.roomUserRepository.update(findOptions, {
      isExit: true,
      newMsgCount: 0,
    });
  }
}