import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("dm_chats")
export class DmChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @ManyToOne(() => UserEntity, (user) => user.dmChats)
  user: UserEntity;

  @Column()
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
