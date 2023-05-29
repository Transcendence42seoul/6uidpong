import { UserEntity } from "src/user/entity/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("games")
export class GameEntity {
  @PrimaryColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  endAt: Date;

  @Column()
  isLadder: boolean;

  @Column()
  isSpeed: boolean;

  @ManyToOne(() => UserEntity, (user) => user.gameRecords, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user1_id" })
  user1: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.gameRecords, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user2_id" })
  user2: UserEntity;

  @Column({ name: "user1_score", default: 0 })
  user1Score: number;

  @Column({ name: "user2_score", default: 0 })
  user2Score: number;
}
