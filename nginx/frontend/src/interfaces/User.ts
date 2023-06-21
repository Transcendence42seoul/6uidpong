interface User {
  id: number;
  nickname: string;
  image: string;
  status: string;
  winStat: number;
  loseStat: number;
  ladderScore: number;
  isBlocked: boolean;
  isFriend: boolean;
  isFriendRequest: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export default User;
