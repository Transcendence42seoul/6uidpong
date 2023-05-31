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
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.channelChats, {
    nullable: false,
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false, name: "is_system", type: "boolean" })
  isSystem: boolean;

  @CreateDateColumn({ nullable: false, name: "created_at" })
  createdAt: Date;
}
