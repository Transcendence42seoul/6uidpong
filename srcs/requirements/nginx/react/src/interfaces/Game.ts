interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean;
  masterId: number;
  participantId: number | null;
}

export default Game;
