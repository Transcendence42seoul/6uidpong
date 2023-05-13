import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DmChatEntity } from "./dm-chat.entity";
import { DmRoomUserEntity } from "./dm-room-user.entity";

@Entity("dm_rooms")
export class DmRoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => DmRoomUserEntity, (roomUser) => roomUser.room, {
    cascade: true,
  })
  roomUsers: DmRoomUserEntity[];

  @OneToMany(() => DmChatEntity, (chat) => chat.room, { cascade: true })
  chats: DmChatEntity[];
}
