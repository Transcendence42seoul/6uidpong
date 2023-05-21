import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity("channel_chats")
export class ChannelChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChannelEntity, (channel) => channel.chats, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: ChannelEntity;

  @ManyToOne(() => UserEntity, (user) => user.channelChats, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column()
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}