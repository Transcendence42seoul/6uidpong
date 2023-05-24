import { User } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DmRoom } from "./dm-room.entity";

@Entity("dm_chats")
export class DmChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DmRoom, (room) => room.chats, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room: DmRoom;

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
