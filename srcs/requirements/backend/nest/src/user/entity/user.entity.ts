import { Ban } from "src/chat/entity/channel/ban.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { ChannelChat } from "src/chat/entity/channel/chat.entity";
import { Block } from "src/chat/entity/dm/block.entity";
import { DmChat } from "src/chat/entity/dm/dm-chat.entity";
import { DmUser } from "src/chat/entity/dm/dm-room-user.entity";
import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { FriendRequest } from "./friend-request.entity";
import { Friend } from "./friend.entity";
import { GameEntity } from "src/game/entity/game.entity";

@Entity("users")
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  @Index()
  nickname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  image: string;

  @Column({ nullable: false, name: "is_2fa", type: "boolean", default: false })
  is2FA: boolean;

  @Column({
    nullable: false,
    default: "offline",
  })
  status: string;

  @Column({ nullable: false, name: "win_stat", default: 0 })
  winStat: number;

  @Column({ nullable: false, name: "lose_stat", default: 0 })
  loseStat: number;

  @Column({ nullable: false, name: "ladder_score", default: 1000 })
  ladderScore: number;

  @Column({ nullable: false, name: "socket_id", default: "" })
  @Index()
  socketId: string;

  @OneToMany(() => DmUser, (dmUser) => dmUser.user)
  dmUsers: DmUser[];

  @OneToMany(() => DmChat, (chat) => chat.user)
  dmChats: DmChat[];

  @OneToMany(() => Block, (block) => block.blockedUser)
  blocks: Block[];

  @OneToMany(() => Ban, (ban) => ban.user)
  bans: Ban[];

  @OneToMany(() => ChannelUser, (channelUser) => channelUser.user)
  channelUsers: ChannelUser[];

  @OneToMany(() => ChannelChat, (chat) => chat.user)
  channelChats: ChannelChat[];

  @OneToMany(() => Friend, (friend) => friend.friend)
  friends: Friend[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.from)
  friendRequests: FriendRequest[];

  @OneToMany(
    () => GameEntity,
    (gameRecord) => {
      gameRecord.user1, gameRecord.user2;
    }
  )
  gameRecords: GameEntity[];
}
