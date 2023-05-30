import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import {
  Ball,
  GameRoomState,
  StartGameRoomState,
  UserGameRoomState,
  gameRoomInfo,
  keyCode,
} from "../dto/game.dto";

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

  private async InitRoomState(
    user1: Socket,
    user2: Socket,
    mode: boolean
  ): Promise<gameRoomInfo> {
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

  broadcastState(roomInfo: gameRoomInfo) {
    const { user1, user2, state } = roomInfo;

    state.paddle1 += state.keyState1 * 4 * 3;
    state.paddle2 += state.keyState1 * 4 * 3;

    if (state.paddle1 > GameInfo.maxy) state.paddle1 = GameInfo.maxy;
    else if (state.paddle1 < -GameInfo.maxy) state.paddle1 = -GameInfo.maxy;
    if (state.paddle2 > GameInfo.maxy) state.paddle2 = GameInfo.maxy;
    else if (state.paddle2 < -GameInfo.maxy) state.paddle2 = -GameInfo.maxy;

    // wall
    if (
      state.ball.y >= GameInfo.height / 2 - GameInfo.ballrad &&
      state.ball.dy > 0
    ) {
      state.ball.dy *= -1;
      state.ball.y =
        (GameInfo.height / 2 - GameInfo.ballrad) * 2 - state.ball.y;
    } else if (
      state.ball.y <= -(GameInfo.height / 2 - GameInfo.ballrad) &&
      state.ball.dy < 0
    ) {
      state.ball.dy *= -1;
      state.ball.y = -(
        (GameInfo.height / 2 - GameInfo.ballrad) * 2 +
        state.ball.y
      );
    }

    //  paddle
    if (
      state.ball.x <=
        -(GameInfo.width / 2 - GameInfo.paddlex - GameInfo.ballrad) &&
      state.paddle1 - GameInfo.paddley / 2 <= state.ball.y &&
      state.paddle1 + GameInfo.paddley / 2 >= state.ball.y &&
      state.ball.dx < 0
    ) {
      state.ball.x = -(
        (GameInfo.width / 2 - GameInfo.paddlex - GameInfo.ballrad) * 2 +
        state.ball.x
      );
      state.ball.dx *= -1;
    } else if (
      state.ball.x >=
        GameInfo.width / 2 - GameInfo.paddlex - GameInfo.ballrad &&
      state.paddle2 - GameInfo.paddley / 2 <= state.ball.y &&
      state.paddle2 + GameInfo.paddley / 2 >= state.ball.y &&
      state.ball.dx > 0
    ) {
      state.ball.x =
        (GameInfo.width / 2 - GameInfo.paddlex - GameInfo.ballrad) * 2 -
        state.ball.x;
      state.ball.dx *= -1;
    }

    //end
    if (state.ball.x >= GameInfo.width / 2 - GameInfo.ballrad) {
      state.score1 += 1;
      state.paddle1 = 0;
      state.paddle2 = 0;
      state.ball = this.InitBallState();
    } else if (state.ball.x <= -(GameInfo.width / 2 - GameInfo.ballrad)) {
      state.score2 += 1;
      state.paddle1 = 0;
      state.paddle2 = 0;
      state.ball = this.InitBallState();
    }

    const userGameRoomState: UserGameRoomState = this.makeUserState(state);

    if (state.score1 >= 5) {
      this.endGame(user1, user2, roomInfo, userGameRoomState);
    } else if (state.score2 >= 5) {
      this.endGame(user2, user1, roomInfo, userGameRoomState);
    }

    user1.emit("game-state", userGameRoomState);
    user2.emit("game-state", userGameRoomState);
  }

  private async endGame(
    winner: Socket,
    loser: Socket,
    roomInfo: gameRoomInfo,
    userGameRoomState: UserGameRoomState
  ) {
    const { roomId, user1, user2, broadcast } = roomInfo;

    user1.emit("game-end", userGameRoomState);
    user1.leave(roomId.toString());
    user1.data.roomId = null;
    user2.emit("game-end", userGameRoomState);
    user2.leave(roomId.toString());
    user2.data.roomId = null;
    clearInterval(broadcast);
    this.roomInfos[roomId] = null;
  }

  async createRoom(user1: Socket, user2: Socket, mode: boolean) {
    const roomInfo: gameRoomInfo = await this.InitRoomState(user1, user2, mode);
    const roomId = roomInfo.roomId;

    await user1.join(roomId.toString());
    await user2.join(roomId.toString());
    user1.data = { ...user1.data, roomId: roomId };
    user2.data = { ...user2.data, roomId: roomId };

    const startState = this.makeStartState(roomInfo);
    user1.emit("game-start", startState);
    user2.emit("game-start", startState);
    this.broadcastState = this.broadcastState.bind(this);
    this.roomInfos[roomId] = roomInfo;
    const broadcast = setInterval(
      this.broadcastState,
      20,
      this.roomInfos[roomId]
    );
    this.roomInfos[roomId].broadcast = broadcast;
  }

  handleKeyState(client: Socket, keyCode: keyCode, keyState: number) {
    const roomId = client.data.roomId;
    const roomInfo = this.roomInfos.find((room) => room.roomId === roomId);
    if (roomInfo.user1 === client) {
      roomInfo.state.keyState1 += keyCode.keyCode * keyState;
    } else if (roomInfo.user2 === client) {
      roomInfo.state.keyState2 += keyCode.keyCode * keyState;
    }
  }
}
