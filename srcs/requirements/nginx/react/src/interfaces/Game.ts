interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean | undefined;
  masterId: number;
  participantId: number | undefined;
}

export default Game;
