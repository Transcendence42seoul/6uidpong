import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DmChatEntity } from "./dm-chat.entity";
import { DmRoomUser } from "./dm-room-user.entity";

@Entity("dm_rooms")
export class DmRoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => DmRoomUser, (roomUser) => roomUser.room)
  roomUsers: DmRoomUser[];

  @OneToMany(() => DmChatEntity, (chat) => chat.room)
  chats: DmChatEntity[];
}
