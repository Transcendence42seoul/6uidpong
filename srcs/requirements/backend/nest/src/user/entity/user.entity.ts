import { DmChatEntity } from "src/chat/entity/dm-chat.entity";
import { DmRoomUserEntity } from "src/chat/entity/dm-room-user.entity";
import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  nickname: string;

  @Column()
  email: string;

  @Column()
  image: string;

  @Column({ name: "is_2fa", type: "boolean", default: false })
  is2FA: boolean;

  @Column({
    default: "offline",
  })
  status: string;

  @Column({ name: "win_stat", default: 0 })
  winStat: number;

  @Column({ name: "lose_stat", default: 0 })
  loseStat: number;

  @Column({ name: "ladder_score", default: 1000 })
  ladderScore: number;

  @Column({ name: "socket_id", default: "" })
  @Index()
  socketId: string;

  @OneToMany(() => DmRoomUserEntity, (dmRoomUser) => dmRoomUser.user)
  dmRoomUsers: DmRoomUserEntity[];

  @OneToMany(() => DmChatEntity, (dmChat) => dmChat.user)
  dmChats: DmChatEntity[];
}
