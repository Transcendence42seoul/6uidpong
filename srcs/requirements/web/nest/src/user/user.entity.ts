import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  constructor(token_id?: number, email?: string, profile_image?: string) {
    this.token_id = token_id;
    this.email = email;
    this.profile_image = profile_image;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  nickname: string;

  @Column({ unique: true })
  token_id: number;

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

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  last_login_at: Date;
}
