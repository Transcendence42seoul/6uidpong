import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class UserEntity {

  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: "image" })
  image: string;

  @Column({ name: "is_2FA", type: "boolean", default: false })
  is2FA: boolean;
}
