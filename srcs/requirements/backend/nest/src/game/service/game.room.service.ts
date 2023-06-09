import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { setTimeout } from "timers";
import { DataSource } from "typeorm";
import {
  Ball,
  GameRoomState,
  StartGameRoomState,
  UserGameRoomState,
  gameRoomInfo,
} from "../dto/game.dto";
import { GameResult } from "../entity/game.entity";

const GameInfo = {
  width: 1200,
  height: 800,
  paddlex: 10,
  paddley: 80,
  maxy: (800 - 80) / 2,
  ballrad: 10,
};

@Injectable()
export class GameRoomService {
  constructor(
    private userService: UserService,
    private dataSource: DataSource
  ) {}

  private roomInfos: gameRoomInfo[] = [];
  private roomNumber = 1;

  private randomSpeed() {
    const n = Math.random();
    return (3 + n * 3) * ((Math.floor(n * 10) % 2) * 2 - 1);
  }

  private InitBallState(): Ball {
    return {
      x: 0,
      y: 0,
      dx: this.randomSpeed(),
      dy: this.randomSpeed(),
    };
  }

  makeStartState(roomInfo: gameRoomInfo) {
    const StartState: StartGameRoomState = {
      roomId: roomInfo.roomId,
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

  makeUserState(roomState: GameRoomState, roomId: number) {
    const userState: UserGameRoomState = {
      roomId: roomId,
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
    player1: number,
    player2: number,
    player1Nickname: string,
    player2Nickname: string,
    mode: boolean,
    isLadder: boolean
  ): Promise<gameRoomInfo> {
    const roomId = this.roomNumber++;
    const roomInfo: gameRoomInfo = {
      roomId: roomId,
      mode: mode,
      isLadder: isLadder,
      user1: user1,
      user2: user2,
      user1Id: player1,
      user2Id: player2,
      player1Nickname: player1Nickname,
      player2Nickname: player2Nickname,
      state: {
        keyState1: 0,
        keyState2: 0,
        paddle1: 0,
        paddle2: 0,
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
    const { roomId, user1, user2, state, mode } = roomInfo;

    state.paddle1 += state.keyState1 * 4 * 3;
    state.paddle2 += state.keyState2 * 4 * 3;

    if (state.paddle1 > GameInfo.maxy) state.paddle1 = GameInfo.maxy;
    else if (state.paddle1 < -GameInfo.maxy) state.paddle1 = -GameInfo.maxy;
    if (state.paddle2 > GameInfo.maxy) state.paddle2 = GameInfo.maxy;
    else if (state.paddle2 < -GameInfo.maxy) state.paddle2 = -GameInfo.maxy;

    state.ball.x += state.ball.dx * 1.5;
    state.ball.y += state.ball.dy * 1.5;

    if (mode === false) {
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
    } else {
      if (
        state.ball.y >= GameInfo.height / 2 - GameInfo.ballrad &&
        state.ball.dy > 0
      ) {
        state.ball.y =
          -(GameInfo.height / 2 - GameInfo.ballrad) * 2 + state.ball.y;
      } else if (
        state.ball.y <= -(GameInfo.height / 2 - GameInfo.ballrad) &&
        state.ball.dy < 0
      ) {
        state.ball.y =
          (GameInfo.height / 2 - GameInfo.ballrad) * 2 + state.ball.y;
      }
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

    const userGameRoomState: UserGameRoomState = this.makeUserState(
      state,
      roomId
    );

    if (user1.disconnected) {
      this.endGame(user2, user1, roomInfo, userGameRoomState, 5, 0);
    } else if (user2.disconnected) {
      this.endGame(user1, user2, roomInfo, userGameRoomState, 5, 0);
    }

    if (state.score1 >= 5) {
      this.endGame(
        user1,
        user2,
        roomInfo,
        userGameRoomState,
        userGameRoomState.score1,
        userGameRoomState.score2
      );
    } else if (state.score2 >= 5) {
      this.endGame(
        user2,
        user1,
        roomInfo,
        userGameRoomState,
        userGameRoomState.score2,
        userGameRoomState.score1
      );
    }
    user1.emit("game-state", userGameRoomState);
    user2.emit("game-state", userGameRoomState);
  }

  calculateLadderScore(): number {
    const min = 13;
    const max = 21;

    const randomValue = Math.floor(Math.random() * (max - min) + min);
    return randomValue;
  }

  async gameResult(
    winner: Socket,
    loser: Socket,
    roomInfo: gameRoomInfo,
    winnerScore: number,
    loserScore: number
  ) {
    const { isLadder, createAt, endAt } = roomInfo;
    const win: User = await this.userService.findBySocketId(winner.id);
    const lose: User = await this.userService.findBySocketId(loser.id);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(GameResult, {
        isLadder,
        winner: {
          id: win.id,
        },
        loser: {
          id: lose.id,
        },
        winnerScore,
        loserScore,
        createdAt: createAt,
        endAt,
      });
      await queryRunner.manager.update(
        User,
        {
          id: win.id,
        },
        {
          winStat: win.winStat + 1,
          ladderScore: isLadder
            ? win.ladderScore + this.calculateLadderScore()
            : win.ladderScore,
          status: "online",
        }
      );
      await queryRunner.manager.update(
        User,
        {
          id: lose.id,
        },
        {
          loseStat: lose.loseStat + 1,
          ladderScore: isLadder
            ? lose.ladderScore - this.calculateLadderScore()
            : lose.ladderScore,
          status: "online",
        }
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async endGame(
    winner: Socket,
    loser: Socket,
    roomInfo: gameRoomInfo,
    userGameRoomState: UserGameRoomState,
    winScore: number,
    loseScore: number
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
    await this.gameResult(winner, loser, roomInfo, winScore, loseScore);
  }

  async createRoom(
    user1: Socket,
    user2: Socket,
    mode: boolean,
    isLadder: boolean
  ) {
    const player1 = await this.userService.findBySocketId(user1.id);
    const player2 = await this.userService.findBySocketId(user2.id);
    await this.userService.updateStatus(player1.id);
    await this.userService.updateStatus(player2.id);

    const roomInfo: gameRoomInfo = await this.InitRoomState(
      user1,
      user2,
      player1.id,
      player2.id,
      player1.nickname,
      player2.nickname,
      mode,
      isLadder
    );
    const roomId = roomInfo.roomId;

    await user1.join(roomId.toString());
    await user2.join(roomId.toString());
    user1.data = { ...user1.data, roomId: roomId };
    user2.data = { ...user2.data, roomId: roomId };

    const startState: StartGameRoomState = this.makeStartState(roomInfo);
    user1.emit("game-start", startState);
    user2.emit("game-start", startState);
    if (roomInfo.isLadder === true) {
      setTimeout(() => {
        this.broadcastState = this.broadcastState.bind(this);
        this.roomInfos[roomId] = roomInfo;
        const broadcast = setInterval(
          this.broadcastState,
          20,
          this.roomInfos[roomId]
        );
        this.roomInfos[roomId].broadcast = broadcast;
      }, 8000);
    } else {
      setTimeout(() => {
        this.broadcastState = this.broadcastState.bind(this);
        this.roomInfos[roomId] = roomInfo;
        const broadcast = setInterval(
          this.broadcastState,
          20,
          this.roomInfos[roomId]
        );
        this.roomInfos[roomId].broadcast = broadcast;
      }, 3000);
    }
  }

  handleKeyState(
    client: Socket,
    keyInfo: {
      roomId: number;
      code: number;
    },
    keyState: number
  ) {
    const roomInfo: gameRoomInfo = this.roomInfos[keyInfo.roomId];
    if (roomInfo) {
      if (roomInfo.user1 === client) {
        roomInfo.state.keyState1 += keyInfo.code * keyState;
      } else if (roomInfo.user2 === client) {
        roomInfo.state.keyState2 += keyInfo.code * keyState;
      }
    }
  }
}
