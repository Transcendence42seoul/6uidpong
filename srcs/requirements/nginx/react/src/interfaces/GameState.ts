interface GameState {
  roomId: number;
  user1Id: number;
  user2Id: number;
  score1: number;
  score2: number;
  ballx: number;
  bally: number;
  paddle1: number;
  paddle2: number;
}

export default GameState;
