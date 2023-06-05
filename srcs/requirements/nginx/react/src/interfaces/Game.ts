import User from "./User";

interface Game {
  roomId: number;
  title: string;
  isLocked: boolean;
  mode: boolean;
  master: User;
  participant: User | undefined;
}

export default Game;
