import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("dm_users")
export class DmUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "room_id" })
  roomId: number;

  @Column()
  userId: number;

  @Column({ name: "is_exit", type: "boolean", default: false })
  isExit: boolean;
}
