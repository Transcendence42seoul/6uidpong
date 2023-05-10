import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { DmUserEntity } from "../entity/dm-user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DmUserEntity)
    private readonly dmUserRepository: Repository<DmUserEntity>
  ) {}

  async findDmRooms(userId: number): Promise<DmUserEntity[]> {
    return await this.dmUserRepository.findBy({
      userId: userId,
      isExit: false,
    });
  }

  async findDmList(userId: number): Promise<Object[]> {
    const query = `
  SELECT last_chats.room_id,
         last_chats.message AS last_message,
         last_chats.created_at AS last_message_time,
         u.nickname,
         u.image
  FROM (
    SELECT room_id,
           message,
           created_at
    FROM dm_chats
    INNER JOIN (
      SELECT dc.room_id, MAX(dc.created_at) AS max_created_at
      FROM dm_chats dc
      INNER JOIN dm_users du ON du.user_id = '${userId}'
        AND du.is_exit = false
        AND du.room_id = dc.room_id
        AND du.created_at >= dc.created_at
      GROUP BY dc.room_id
    ) max_chats ON dm_chats.room_id = max_chats.room_id AND dm_chats.created_at = max_chats.max_created_at
  ) last_chats
  INNER JOIN dm_users du ON last_chats.room_id = du.room_id AND du.user_id <> '${userId}'
  INNER JOIN users u ON du.user_id = u.id
  ORDER BY last_chats.created_at DESC
`;

    const results = await getConnection().query(query);
    console.log(results);
    return results;
  }
}
