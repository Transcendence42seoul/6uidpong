import { ChannelChat } from "src/chat/entity/channel/channel-chat.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { DmChat } from "src/chat/entity/dm/dm-chat.entity";
import { DmRoomUser } from "src/chat/entity/dm/dm-room-user.entity";
import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { FriendRequest } from "./friend-request.entity";
import { Friend } from "./friend.entity";

@Entity("users")
export class User {
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

  @OneToMany(() => DmRoomUser, (dmRoomUser) => dmRoomUser.user)
  dmRoomUsers: DmRoomUser[];

  @OneToMany(() => DmChat, (chat) => chat.user)
  dmChats: DmChat[];

  @OneToMany(() => ChannelUser, (channelUser) => channelUser.user)
  channelUsers: ChannelUser[];

  @OneToMany(() => ChannelChat, (chat) => chat.user)
  channelChats: ChannelChat[];

  @OneToMany(() => Friend, (friend) => friend.friend)
  friends: Friend[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.from)
  friendRequests: FriendRequest[];
}
