import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChatEntity } from "./channel-chat.entity";
import { ChannelUserEntity } from "./channel-user.entity";

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

  @OneToMany(() => ChannelUserEntity, (channelUser) => channelUser.channel)
  channelUsers: ChannelUserEntity[];

  @OneToMany(() => ChannelChatEntity, (chat) => chat.channel)
  chats: ChannelChatEntity[];
}
