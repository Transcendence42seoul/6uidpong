import { Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface GameRoomState {
  keyState1: number;
  keyState2: number;
  paddle1: number;
  paddle2: number;
  ball: Ball;
  score1: number;
  score2: number;
}

export interface StartGameRoomState {
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

export interface UserGameRoomState {
  roomId: number;
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

export interface gameRoomInfo {
  roomId: number;
  mode: boolean;
  isLadder: boolean;
  user1: Socket;
  user2: Socket;
  user1Id: number;
  user2Id: number;
  player1Nickname: string;
  player2Nickname: string;
  state: GameRoomState;
  broadcast: NodeJS.Timeout;
  createAt: Date;
  endAt: Date;
}

export interface keyCode {
  keyCode: number;
}

export interface customRoomInfo {
  roomId: number;
  title: string;
  isLocked: boolean;
  masterId: number;
  participantId: number | undefined;
}

export interface customRoomPassword {
  roomId: number;
  master: Socket;
  participant: Socket | undefined;
  password: string | null;
}
