import { UserEntity } from "src/user/entity/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("blocklist")
export class BlocklistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "blocked_user_id" })
  blockedUser: UserEntity;
}
