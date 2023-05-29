import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { Ball, GameRoomState, StartGameRoomState, UserGameRoomState, gameRoomInfo, keyCode } from "../dto/game.dto";

const GameInfo = {
  width: 640,
  height: 660,
  paddlex: 10,
  paddley: 80,
  maxy: (660 - 80) / 2,
  ballrad: 10,
};

@Injectable()
export class GameRoomService {
  constructor() {}

  private roomInfos: gameRoomInfo[] = [];
  private roomNumber = 1;

  private InitBallState(): Ball {
    return {
      x: GameInfo.width / 2,
      y: GameInfo.height / 2,
      dx: 3,
      dy: 3,
    };
  }

  makeStartState(roomInfo: gameRoomInfo) {
    const StartState: StartGameRoomState = {
      user1Id: roomInfo.user1Id,
      user2Id: roomInfo.user2Id,
      paddle1: roomInfo.state.paddle1,
      paddle2: roomInfo.state.paddle2,
      ballx: roomInfo.state.ball.x,
      bally: roomInfo.state.ball.y,
      score1: roomInfo.state.score1,
      score2: roomInfo.state.score2,
    };
    return StartState;
  }

  makeUserState(roomState: GameRoomState) {
    const userState: UserGameRoomState = {
      paddle1: roomState.paddle1,
      paddle2: roomState.paddle2,
      ballx: roomState.ball.x,
      bally: roomState.ball.y,
      score1: roomState.score1,
      score2: roomState.score2,
    };
    return userState;
  }

  private async InitRoomState(user1: Socket, user2: Socket, mode: boolean): Promise<gameRoomInfo> {  
    const roomId = this.roomNumber++;

    const roomInfo: gameRoomInfo = {
      roomId: roomId,
      isLadder: mode,
      user1: user1,
      user2: user2,
      // id userrepo에서 가져오는걸로 수정 필요.
      user1Id: user1.data.id,
      user2Id: user2.data.id,
      state: {
        keyState1: 0,
        keyState2: 0,
        paddle1: GameInfo.maxy,
        paddle2: GameInfo.maxy,
        ball: this.InitBallState(),
        score1: 0,
        score2: 0,
      },
      createAt: new Date(),
      endAt: new Date(),
      broadcast: null,
    };
    return roomInfo;
  }

  async createRoom(user1: Socket, user2: Socket, mode: boolean) {
    const roomInfo: gameRoomInfo = await this.InitRoomState(user1, user2, mode);
    const roomId = roomInfo.roomId;

    await user1.join(roomId.toString());
    await user2.join(roomId.toString());
    user1.data = { ...user1.data, roomId: roomId };
    user2.data = { ...user2.data, roomId: roomId };

    const startState = this.makeStartState(roomInfo);
    user1.emit('game-start', startState);
    user2.emit('game-start', startState);
    this.broadcastState = this.broadcastState.bind(this);
    this.roomInfos[roomId] = roomInfo;
    const broadcast = setInterval(
      this.broadcastState,
      20,
      this.roomInfos[roomId],
    );
    this.roomInfos[roomId].broadcast = broadcast;
  }

  handleKeyState(client:Socket, keyCode: keyCode, keyState: number) {
    const roomId = client.data.roomId;
    const roomInfo = this.roomInfos.find((room) => room.roomId === roomId);
    if (roomInfo.user1 === client) {
      roomInfo.state.keyState1 += keyCode.keyCode * keyState;
    } else if (roomInfo.user2 === client) {
      roomInfo.state.keyState2 += keyCode.keyCode * keyState;
    }
  }
}
