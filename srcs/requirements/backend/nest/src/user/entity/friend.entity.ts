import { User } from "src/user/entity/user.entity";
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("friends")
export class FriendEntity {
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

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
