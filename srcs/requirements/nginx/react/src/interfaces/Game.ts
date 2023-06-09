export interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean | undefined;
  masterId: number;
  participantId: number | undefined;
}

export interface GameRoomState {
  roomId: number;
  user1Id: number;
  user2Id: number;
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}
