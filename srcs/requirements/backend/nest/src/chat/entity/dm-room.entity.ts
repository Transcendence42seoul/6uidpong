import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("dm_rooms")
export class DmRoomEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
