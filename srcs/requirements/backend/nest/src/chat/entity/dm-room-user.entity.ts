import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("dm_room_users")
export class DmRoomUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "is_exit", type: "boolean", default: false })
  isExit: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
