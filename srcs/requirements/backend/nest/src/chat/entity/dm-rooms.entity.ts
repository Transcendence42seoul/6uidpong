import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("dm_rooms")
export class DmRoomEntity {
  @PrimaryGeneratedColumn({ name: "dm_room_id" })
  id: number;

  @CreateDateColumn({ name: "create_at" })
  createAt: Date;
}
