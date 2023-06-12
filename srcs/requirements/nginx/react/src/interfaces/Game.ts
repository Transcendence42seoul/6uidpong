interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  isPrivate: boolean;
  mode: boolean | undefined;
  masterId: number;
  participantId: number | undefined;
}

export default Game;
