import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column()
  token_id: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  profile_image: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @Column({ type: "timestamp", nullable: true })
  last_login_at: Date;
}
