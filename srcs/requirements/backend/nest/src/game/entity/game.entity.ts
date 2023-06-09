import { User } from "src/user/entity/user.entity";
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
export class GameResult {
  @PrimaryColumn()
  id: number;

  @Column({ name: "is_ladder" })
  isLadder: boolean;

  @ManyToOne(() => User, (user) => user.gameRecords, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "winner_id" })
  winner: User;

  @ManyToOne(() => User, (user) => user.gameRecords, {
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "loser_id" })
  loser: User;

  @Column({ name: "winner_score", default: 0 })
  winnerScore: number;

  @Column({ name: "loser_score", default: 0 })
  loserScore: number;

  @Column({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "end_at" })
  endAt: Date;
}
