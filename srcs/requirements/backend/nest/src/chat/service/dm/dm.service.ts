import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entity/user.entity";
import { Repository, MoreThanOrEqual, DataSource, InsertResult } from "typeorm";
import { DmRoomResponse } from "../../dto/dm/dm-rooms-response.dto";
import { DmChat } from "../../entity/dm/dm-chat.entity";
import { DmRoomUser } from "../../entity/dm/dm-room-user.entity";
import { DmRoom } from "../../entity/dm/dm-room.entity";

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DmRoom)
    private readonly roomRepository: Repository<DmRoom>,
    @InjectRepository(DmRoomUser)
    private readonly roomUserRepository: Repository<DmRoomUser>,
    @InjectRepository(DmChat)
    private readonly chatRepository: Repository<DmChat>,
    private readonly dataSource: DataSource
  ) {}

  async findRooms(userId: number): Promise<DmRoomResponse[]> {
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
      .addSelect((subQuery) => {
        return subQuery
          .select("sub.new_msg_count")
          .from(DmRoomUser, "sub")
          .where("sub.user_id = :userId")
          .andWhere("sub.room_id = dm_chats.room_id");
      }, "newMsgCount")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("sub_dm_chats.room_id", "room_id")
            .addSelect("MAX(sub_dm_chats.created_at)", "max_created_at")
            .from(DmChat, "sub_dm_chats")
            .innerJoin(
              DmRoomUser,
              "room_users",
              "room_users.user_id = :userId AND room_users.is_exit = false AND room_users.room_id = sub_dm_chats.room_id"
            )
            .groupBy("sub_dm_chats.room_id"),
        "last_chats",
        "dm_chats.room_id = last_chats.room_id AND dm_chats.created_at = last_chats.max_created_at"
      )
      .innerJoin(
        DmRoomUser,
        "room_users",
        "dm_chats.room_id = room_users.room_id AND room_users.user_id != :userId"
      )
      .innerJoin(User, "users", "room_users.user_id = users.id")
      .orderBy("dm_chats.created_at", "DESC")
      .setParameter("userId", userId)
      .getRawMany();
  }

  async findUserOrFail(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUser> {
    return await this.roomUserRepository
      .createQueryBuilder("room_user")
      .select()
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("d.room_id")
            .from(DmRoomUser, "d")
            .where("d.user_id IN (:userId, :interlocutorId)")
            .groupBy("d.room_id")
            .having("COUNT(DISTINCT d.user_id) = 2"),
        "match_room_user",
        "room_user.room_id = match_room_user.room_id"
      )
      .innerJoin("room_user.user", "user")
      .where("room_user.user_id = :userId")
      .setParameters({ userId, interlocutorId })
      .getOneOrFail();
  }

  async updateUser(roomUser: DmRoomUser): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findOptions: Object = {
        roomId: roomUser.roomId,
        userId: roomUser.userId,
      };
      if (roomUser.isExit) {
        await queryRunner.manager.update(DmRoomUser, findOptions, {
          isExit: false,
          createdAt: new Date(),
        });
      } else if (roomUser.newMsgCount > 0) {
        await queryRunner.manager.update(DmRoomUser, findOptions, {
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

  async insertUsers(
    userId: number,
    interlocutorId: number
  ): Promise<DmRoomUser> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newRoom: InsertResult = await queryRunner.manager.insert(
        DmRoom,
        new DmRoom()
      );
      await queryRunner.manager.insert(DmRoomUser, [
        {
          roomId: newRoom.identifiers[0].id,
          userId: interlocutorId,
        },
        {
          roomId: newRoom.identifiers[0].id,
          userId,
        },
      ]);

      await queryRunner.commitTransaction();

      return await this.roomUserRepository.findOneBy({
        roomId: newRoom.identifiers[0].id,
        userId,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findChats(roomUser: DmRoomUser): Promise<DmChat[]> {
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

  async insertChat(
    senderId: number,
    message: string,
    recipient: DmRoomUser,
    isJoined: boolean
  ): Promise<DmChat> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newChat: InsertResult = await queryRunner.manager.insert(DmChat, {
        user: {
          id: senderId,
        },
        room: {
          id: recipient.roomId,
        },
        message,
      });
      if (recipient.isExit) {
        await queryRunner.manager.update(
          DmRoomUser,
          {
            userId: recipient.userId,
            roomId: recipient.roomId,
          },
          {
            isExit: false,
            createdAt: newChat.generatedMaps[0].createdAt,
          }
        );
      }
      if (!isJoined) {
        await queryRunner.manager.increment(
          DmRoomUser,
          {
            userId: recipient.userId,
            roomId: recipient.roomId,
          },
          "newMsgCount",
          1
        );
      }

      await queryRunner.commitTransaction();

      return await this.chatRepository.findOneBy({
        id: newChat.identifiers[0].id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findChat(id: number): Promise<DmChat> {
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
