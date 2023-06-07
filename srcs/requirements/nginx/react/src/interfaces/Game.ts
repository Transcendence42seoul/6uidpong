export interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean;
  masterId: number;
  participantId: number | null;
}

export interface GameRoomState {
  roomId: number;
  user1: number;
  user2: number;
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}
