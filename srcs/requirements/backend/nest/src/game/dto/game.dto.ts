import { Socket } from "socket.io";

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
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

export interface gameRoomInfo {
  roomId: number;
  isLadder: boolean;
  user1: Socket;
  user2: Socket;
  user1Id: number; 
  user2Id: number;
  state: GameRoomState;
  broadcast: NodeJS.Timeout;
  createAt: Date;
  endAt: Date;
}

export interface keyCode {
  keyCode: number;
}

export interface inviteRoomDto {
  user1: Socket;
  uid1: number;
  uid2: number;
}