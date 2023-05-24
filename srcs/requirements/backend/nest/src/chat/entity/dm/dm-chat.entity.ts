import { User } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DmRoomEntity } from "./dm-room.entity";

@Entity("dm_chats")
export class DmChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DmRoomEntity, (room) => room.chats, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room: DmRoomEntity;

  @ManyToOne(() => User, (user) => user.dmChats, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
