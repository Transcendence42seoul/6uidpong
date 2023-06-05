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
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room: DmRoom;

  @ManyToOne(() => User, (user) => user.dmChats, {
    nullable: false,
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn({
    nullable: false,
    name: "created_at",
  })
  createdAt: Date;
}
