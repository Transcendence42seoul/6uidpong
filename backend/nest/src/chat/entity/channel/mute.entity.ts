import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity("mute_list")
export class Mute {
  @PrimaryColumn({ name: "channel_id" })
  channelId: number;

  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @ManyToOne(() => Channel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "channel_id" })
  channel: Channel;

  @ManyToOne(() => User, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false, name: "limited_at" })
  limitedAt: Date;
}
