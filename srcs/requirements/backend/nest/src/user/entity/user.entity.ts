import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { GameEntity } from "src/game/entity/game.entity";

@Entity("users")
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column()
  email: string;

  @Column()
  image: string;

  @Column({ name: "is_2fa", type: "boolean", default: false })
  is2FA: boolean;

  @Column({ default: "offline" })
  status: string;

  @Column({ name: "win_stat", default: 0 })
  winStat: number;

  @Column({ name: "lose_stat", default: 0 })
  loseStat: number;

  @Column({ name: "ladder_score", default: 1000 })
  ladderScore: number;

  @OneToMany(
    () => GameEntity,
    (gameRecord) => {
      gameRecord.user1, gameRecord.user2;
    }
  )
  gameRecords: GameEntity[];
}
