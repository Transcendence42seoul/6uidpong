import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DmChat } from "./dm-chat.entity";
import { DmUser } from "./dm-room-user.entity";

@Entity("dm_rooms")
export class DmRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => DmUser, (roomUser) => roomUser.room)
  roomUsers: DmUser[];

  @OneToMany(() => DmChat, (chat) => chat.room)
  chats: DmChat[];
}
