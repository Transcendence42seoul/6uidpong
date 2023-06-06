import React, { useEffect, useRef, useState } from 'react';
import { selectGameSocket } from '../features/socket/socketSelector';
import { GameRoomState } from '../interfaces/Game';

const GameInfo = {
  width: 640,
  height: 660,
  paddleX: 10,
  paddleY: 80,
  maxY: (660 - 80) / 2,
  ballr: 10,
};

const GameStart: React.FC = () => {
  const { gameSocket } = selectGameSocket();
  const ref = useRef<HTMLCanvasElement>(null);
  const [gameRoomState, setGameRoomState] = useState<GameRoomState>();
  const cvs = ref.current;

  useEffect(() => {
    gameSocket?.on('game-state', (data) => {
      setGameRoomState(data);
    });
  }, [gameRoomState]);

  useEffect(() => {
    gameSocket?.emit('keyup');
    gameSocket?.on('game-state', (data) => {
      setGameRoomState(data);
    });
  }, [gameRoomState]);

  useEffect(() => {
    gameSocket?.emit('keydown');
    gameSocket?.on('game-state', (data) => {
      setGameRoomState(data);
    });
  }, [gameRoomState]);

  if (cvs) {
    cvs.width = GameInfo.width;
    cvs.height = GameInfo.height;
    const ctx = cvs.getContext('2d');
    if (ctx === null) return <div />;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GameInfo.width, GameInfo.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic bold 100px Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.setLineDash([20, 20]);
    ctx.moveTo(GameInfo.width / 2, 0);
    ctx.lineTo(GameInfo.width / 2, GameInfo.height);
    ctx.stroke();
    if (gameRoomState !== undefined) {
      // Score
      //  Left
      ctx.font = '50px Arial, sans-serif';
      ctx.fillText(
        gameRoomState.score1.toString(),
        GameInfo.width / 4,
        GameInfo.height / 4,
      );
      //  Right
      ctx.fillText(
        gameRoomState.score2.toString(),
        (GameInfo.width / 4) * 3,
        GameInfo.height / 4,
      );
      // Left Paddle
      ctx.fillRect(
        0,
        (GameInfo.height - GameInfo.paddleY) / 2 + gameRoomState.paddle1,
        GameInfo.paddleX,
        GameInfo.paddleY,
      );
      // Right Paddle
      ctx.fillRect(
        GameInfo.width - GameInfo.paddleX,
        (GameInfo.height - GameInfo.paddleY) / 2 + gameRoomState.paddle2,
        GameInfo.paddleX,
        GameInfo.paddleY,
      );
      // Ball
      ctx.beginPath();
      ctx.arc(
        gameRoomState.ballX + GameInfo.width / 2,
        gameRoomState.ballY + GameInfo.height / 2,
        GameInfo.ballr,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.closePath();
      //
    }
    ctx.stroke();
  }

  return (
    <div>
      <canvas ref={ref} />
    </div>
  );
};

export default GameStart;
