import { User } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Channel } from "./channel.entity";

@Entity("channel_chats")
export class ChannelChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.chats, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.channelChats, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  message: string;

  @Column({ name: "is_system", type: "boolean" })
  isSystem: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
