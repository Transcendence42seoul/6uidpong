import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DmRoomEntity } from "./dm-room.entity";

@Entity("dm_room_users")
export class DmRoomUserEntity {
  @PrimaryColumn({ name: "room_id" })
  roomId: number;

  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @ManyToOne(() => DmRoomEntity, (dmRoom) => dmRoom.roomUsers)
  @JoinColumn({ name: "room_id" })
  room: DmRoomEntity;

  @ManyToOne(() => UserEntity, (user) => user.dmRoomUsers)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ name: "is_exit", type: "boolean", default: false })
  isExit: boolean;

  @Column({ name: "new_msg_count", default: 0 })
  newMsgCount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
