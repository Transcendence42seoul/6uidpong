import { UserEntity } from "src/user/entity/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("block")
export class BlockEntity {
  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @PrimaryColumn({ name: "blocked_user_id" })
  blockedUserId: number;

  @ManyToOne(() => UserEntity, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => UserEntity, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "blocked_user_id" })
  blockedUser: UserEntity;
}
