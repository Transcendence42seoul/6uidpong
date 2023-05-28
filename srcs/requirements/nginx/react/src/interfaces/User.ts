interface User {
  id: number;
  nickname: string;
  image: string;
  status: string;
  winStat: number;
  loseStat: number;
  ladderScore: number;
  isOwner: boolean;
  isAdmin: boolean;
}

export default User;
