import { UserEntity } from "src/user/entity/user.entity";
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

  @ManyToOne(() => DmRoomEntity, (room) => room.chats)
  @JoinColumn({ name: "room_id" })
  room: DmRoomEntity;

  @ManyToOne(() => UserEntity, (user) => user.dmChats)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column()
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
