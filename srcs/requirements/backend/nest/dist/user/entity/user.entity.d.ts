import { ChannelChat } from "src/chat/entity/channel/channel-chat.entity";
import { ChannelUser } from "src/chat/entity/channel/channel-user.entity";
import { DmChat } from "src/chat/entity/dm/dm-chat.entity";
import { DmRoomUser } from "src/chat/entity/dm/dm-room-user.entity";
import { FriendRequest } from "./friend-request.entity";
import { Friend } from "./friend.entity";
export declare class User {
    id: number;
    nickname: string;
    email: string;
    image: string;
    is2FA: boolean;
    status: string;
    winStat: number;
    loseStat: number;
    ladderScore: number;
    socketId: string;
    dmRoomUsers: DmRoomUser[];
    dmChats: DmChat[];
    channelUsers: ChannelUser[];
    channelChats: ChannelChat[];
    friends: Friend[];
    friendRequests: FriendRequest[];
}
