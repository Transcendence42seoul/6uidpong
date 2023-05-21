import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity("channel_users")
export class ChannelUserEntity {
  @PrimaryColumn({ name: "channel_id" })
  channelId: number;

  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @ManyToOne(() => ChannelEntity, (channel) => channel.channelUsers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: ChannelEntity;

  @ManyToOne(() => UserEntity, (user) => user.dmRoomUsers, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ name: "new_msg_count", default: 0 })
  newMsgCount: number;

  @Column({ name: "is_owner", type: "boolean", default: false })
  isOwner: boolean;

  @Column({ name: "is_admin", type: "boolean", default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
