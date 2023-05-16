import { UserEntity } from "src/user/entity/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("blocklist")
export class BlocklistEntity {
  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @PrimaryColumn({ name: "blocked_user_id" })
  blockedUserId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "blocked_user_id" })
  blockedUser: UserEntity;
}
