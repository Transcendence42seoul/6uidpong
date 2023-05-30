import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DmChat } from "./dm-chat.entity";
import { DmRoomUser } from "./dm-room-user.entity";

@Entity("dm_rooms")
export class DmRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => DmRoomUser, (roomUser) => roomUser.room)
  roomUsers: DmRoomUser[];

  @OneToMany(() => DmChat, (chat) => chat.room)
  chats: DmChat[];
}
