import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChat } from "./chat.entity";
import { ChannelUser } from "./channel-user.entity";

@Entity("channels")
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  title: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, name: "is_public", type: "boolean" })
  isPublic: boolean;

  @CreateDateColumn({ nullable: false, name: "created_at" })
  createdAt: Date;

  @OneToMany(() => ChannelUser, (channelUser) => channelUser.channel)
  channelUsers: ChannelUser[];

  @OneToMany(() => ChannelChat, (chat) => chat.channel)
  chats: ChannelChat[];
}
