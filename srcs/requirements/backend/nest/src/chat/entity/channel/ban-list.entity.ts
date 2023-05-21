import { UserEntity } from "src/user/entity/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity("ban_list")
export class BanEntity {
  @PrimaryColumn({ name: "channel_id" })
  channelId: number;

  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @ManyToOne(() => ChannelEntity, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: ChannelEntity;

  @ManyToOne(() => UserEntity, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}
