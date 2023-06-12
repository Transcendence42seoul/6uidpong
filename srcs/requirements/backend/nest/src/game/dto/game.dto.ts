import { Socket } from "socket.io";
import { GameResult } from "../entity/game.entity";

export class GameResultResponse {
  constructor(entity: GameResult) {
    this.isLadder = entity.isLadder;
    this.winnerNickname = entity.winner.nickname;
    this.loserNickname = entity.loser.nickname;
    this.winnerImage = entity.winner.image;
    this.loserImage = entity.loser.image;
    this.winnerScore = entity.winnerScore;
    this.loserScore = entity.loserScore;
    this.createdAt = entity.createdAt;
    this.endAt = entity.endAt;
  }
  readonly isLadder: boolean;
  readonly winnerNickname: string;
  readonly loserNickname: string;
  readonly winnerImage: string;
  readonly loserImage: string;
  readonly winnerScore: number;
  readonly loserScore: number;
  readonly createdAt: Date;
  readonly endAt: Date;
}

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

export interface GameState {
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
  isPrivate: boolean;
  masterId: number;
  participantId: number | undefined;
}

export interface roomSecretInfo {
  roomId: number;
  master: Socket;
  participant: Socket | undefined;
  password: string | null;
}
