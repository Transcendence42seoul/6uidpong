import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("friends")
export class FriendEntity {
  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @PrimaryColumn({ name: "friend_id" })
  friendId: number;

  @ManyToOne(() => UserEntity, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => UserEntity, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "friend_id" })
  friendUser: UserEntity;

  @Column({ name: "is_accept", type: "boolean", default: false })
  isAccept: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
