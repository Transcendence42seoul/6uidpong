import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("dm_blocklist")
export class DmBlocklistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "blocked_user_id" })
  blockedUserid: number;
}
