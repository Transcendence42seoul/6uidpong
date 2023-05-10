import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("dm_chats")
export class DmChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column()
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
