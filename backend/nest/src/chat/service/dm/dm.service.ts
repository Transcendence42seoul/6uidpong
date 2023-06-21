import { Injectable } from "@nestjs/common";
import { Namespace, Socket } from "socket.io";
import { BlockResponse } from "src/chat/dto/dm/block-response";
import { JoinResponse } from "src/chat/dto/dm/join-response";
import { SendResponse } from "src/chat/dto/dm/send-response";
import { Block } from "src/chat/entity/dm/block.entity";
import { Friend } from "src/user/entity/friend.entity";
import { DataSource, InsertResult } from "typeorm";
import { RoomResponse } from "../../dto/dm/room-response";
import { DmChat } from "../../entity/dm/dm-chat.entity";
import { DmUser } from "../../entity/dm/dm-room-user.entity";
import { DmRoom } from "../../entity/dm/dm-room.entity";
import { BlockService } from "./block.service";
import { DmChatService } from "./dm-chat.service";
import { DmRoomService } from "./dm-room.service";
import { DmUserService } from "./dm-user.service";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class DmService {
  constructor(
    private readonly roomService: DmRoomService,
    private readonly chatService: DmChatService,
    private readonly dmUserService: DmUserService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async findRooms(userId: number): Promise<RoomResponse[]> {
    return await this.roomService.find(userId);
  }

  async join(
    userId: number,
    interlocutorId: number,
    client: Socket
  ): Promise<JoinResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let dmUser: DmUser = await this.dmUserService.findOne(
        userId,
        interlocutorId
      );
      if (!dmUser) {
        const { identifiers }: InsertResult = await queryRunner.manager.insert(
          DmRoom,
          new DmRoom()
        );
        await queryRunner.manager.insert(DmUser, [
          {
            roomId: identifiers[0].id,
            userId: interlocutorId,
          },
          {
            roomId: identifiers[0].id,
            userId,
          },
        ]);
        dmUser = await queryRunner.manager.findOneBy(DmUser, {
          roomId: identifiers[0].id,
          userId,
        });
      } else {
        const primaryKey = {
          roomId: dmUser.roomId,
          userId: dmUser.userId,
        };
        if (dmUser.isExit) {
          await queryRunner.manager.update(DmUser, primaryKey, {
            isExit: false,
            createdAt: new Date(),
          });
        } else if (dmUser.newMsgCount > 0) {
          await queryRunner.manager.update(DmUser, primaryKey, {
            newMsgCount: 0,
          });
        }
      }
      await queryRunner.commitTransaction();

      client.join("d" + dmUser.roomId);
      const chats: DmChat[] = await this.chatService.find(
        dmUser.roomId,
        dmUser.createdAt
      );
      return new JoinResponse(
        interlocutorId,
        dmUser.newMsgCount,
        await this.blockService.isBlocked(
          interlocutorId,
          userId
        ),
        chats
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async send(
    senderId: number,
    recipientId: number,
    message: string,
    client: Socket,
    server: Namespace
  ): Promise<void> {
    await this.blockService.verify(senderId, recipientId);
    const recipient: DmUser = await this.dmUserService.findOneOrFail(
      recipientId,
      senderId
    );
    const joinSockets = await server.in("d" + recipient.roomId).fetchSockets();
    const isJoined: boolean = joinSockets.some(
      (socket) => socket.id === recipient.user.socketId
    );
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const insertResult: InsertResult = await queryRunner.manager.insert(
        DmChat,
        {
          user: {
            id: senderId,
          },
          room: {
            id: recipient.roomId,
          },
          message,
        }
      );
      if (recipient.isExit) {
        await queryRunner.manager.update(
          DmUser,
          {
            userId: recipient.userId,
            roomId: recipient.roomId,
          },
          {
            isExit: false,
            createdAt: insertResult.generatedMaps[0].createdAt,
          }
        );
      }
      if (!isJoined) {
        await queryRunner.manager.increment(
          DmUser,
          {
            userId: recipient.userId,
            roomId: recipient.roomId,
          },
          "newMsgCount",
          1
        );
      }

      await queryRunner.commitTransaction();

      const chat: DmChat = await this.chatService.findOneOrFail(
        insertResult.identifiers[0].id
      );
      server
        .to([client.id, recipient.user.socketId])
        .emit("send-dm", new SendResponse(recipient.roomId, chat));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRoom(
    userId: number,
    interlocutorId: number,
    client: Socket
  ): Promise<void> {
    const interUser: DmUser = await this.dmUserService.findOneOrFail(
      interlocutorId,
      userId
    );
    if (interUser.isExit) {
      await this.roomService.delete(interUser.roomId);
    } else {
      await this.dmUserService.exit(interUser.roomId, userId);
    }
    client.leave("d" + interUser.roomId);
  }

  async findBlockUsers(userId: number): Promise<BlockResponse[]> {
    const blocks: Block[] = await this.blockService.find(userId);
    return blocks.map((block) => new BlockResponse(block));
  }

  async block(userId: number, interlocutorId: number, client: Socket): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(Block, {
        userId: userId,
        blockedUserId: interlocutorId,
      });
      await queryRunner.manager.delete(Friend, [
        {
          userId,
          friendId: interlocutorId,
        },
        {
          userId: interlocutorId,
          friendId: userId,
        },
      ]);
      await queryRunner.commitTransaction();
      const interlocutor: User = await this.userService.findOneOrFail(interlocutorId);
      client.to(interlocutor.socketId).emit("block", { userId });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unblock(userId: number, interlocutorId: number): Promise<void> {
    await this.blockService.delete(userId, interlocutorId);
  }
}
