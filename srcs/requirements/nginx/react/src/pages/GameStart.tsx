import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface GameRoomState {
  user1Id: number;
  user2Id: number;
  paddle1: number;
  padddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

interface CanvasState {
  status: number;
  gameRoomState: GameRoomState | undefined;
}

interface UserGameRoomState {
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

const GameInfo = {
  width: 640,
  height: 660,
  paddlex: 10,
  paddley: 80,
  maxy: (660 - 80) / 2,
  ballr: 10,
};

interface GameStartProps {
  socketGame: Socket;
}

const GameStart: React.FC<GameStartProps> = ({ socketGame }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const canvas = ref.current;

  if (canvas) {
    canvas.width = GameInfo.width;
    canvas.height = GameInfo.height;
    // const ctx = canvas.getContext('2d');
    // if (ctx === null) return <></>;
    // ctx.fillStyle = '#000000';
    // ctx.fillRect(0, 0, GameInfo.width, GameInfo.height);
    // ctx.fillStyle = '#FFFFFF';
    // ctx.beginPath();
    // ctx.strokeStyle = '#FFFFFF';
    // ctx.setLineDash([20, 20]);
    // ctx.moveTo(GameInfo.width / 2, 0);
    // ctx.lineTo(GameInfo.width / 2, GameInfo.height);
    // ctx.stroke();
  }

  return (
    <div>
      <canvas ref={ref} />
    </div>
  );
};

export default GameStart;
