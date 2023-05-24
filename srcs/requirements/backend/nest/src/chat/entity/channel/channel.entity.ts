import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChatEntity } from "./channel-chat.entity";
import { ChannelUser } from "./channel-user.entity";

@Entity("channels")
export class ChannelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: "is_public", type: "boolean" })
  isPublic: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => ChannelUser, (channelUser) => channelUser.channel)
  channelUsers: ChannelUser[];

  @OneToMany(() => ChannelChatEntity, (chat) => chat.channel)
  chats: ChannelChatEntity[];
}
