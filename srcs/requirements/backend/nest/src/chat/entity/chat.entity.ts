import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("dm_chats")
export class DmChatEntity {
  @PrimaryGeneratedColumn({ name: "dm_chat_id" })
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @Column()
  sender: number;

  @Column()
  recipient: number;

  @Column()
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
