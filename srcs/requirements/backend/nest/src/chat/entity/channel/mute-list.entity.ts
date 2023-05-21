import { UserEntity } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity("mute_list")
export class MuteEntity {
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

  @Column({ name: "limited_at" })
  limitedAt: Date;
}
