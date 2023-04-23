import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  constructor(
    id?: number,
    nickname?: string,
    email?: string,
    profileImage?: string,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.email = email;
    this.profileImage = profileImage;
  }

  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column()
  email: string;

  @Column({ name: "profile_image" })
  profileImage: string;

  @Column({ name: "is_two_factor", type: "boolean", default: false })
  isTwoFactor: boolean;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updateAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({
    name: "last_login_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  lastLoginAt: Date;
}