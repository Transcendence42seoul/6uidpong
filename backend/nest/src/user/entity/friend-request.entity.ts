import { User } from "src/user/entity/user.entity";
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("friend_requests")
export class FriendRequest {
  @PrimaryColumn({ name: "from_id" })
  fromId: number;

  @PrimaryColumn({ name: "to_id" })
  toId: number;

  @ManyToOne(() => User, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "from_id" })
  from: User;

  @ManyToOne(() => User, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "to_id" })
  to: User;

  @CreateDateColumn({
    nullable: false,
    name: "created_at",
  })
  createdAt: Date;
}
