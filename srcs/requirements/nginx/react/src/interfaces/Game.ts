export interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean;
  masterId: number;
  participantId: number | null;
}

export interface GameRoomState {
  user1: number;
  user2: number;
  paddle1: number;
  paddle2: number;
  ballX: number;
  ballY: number;
  score1: number;
  score2: number;
}
