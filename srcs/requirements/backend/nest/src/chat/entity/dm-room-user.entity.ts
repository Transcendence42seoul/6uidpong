import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("dm_room_users")
export class DmRoomUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @ManyToOne(() => UserEntity, (user) => user.dmRoomUsers)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ name: "is_exit", type: "boolean", default: false })
  isExit: boolean;

  @Column({ name: "has_new_msg", default: false })
  hasNewMsg: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
