import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectGameSocket } from '../features/socket/socketSelector';
import { GameRoomState } from '../interfaces/Game';

const GameInfo = {
  width: 1200,
  height: 800,
  paddleX: 10,
  paddleY: 80,
  maxY: (800 - 80) / 2,
  ballr: 10,
};

const GameStart: React.FC = () => {
  const { gameSocket } = selectGameSocket();
  const ref = useRef<HTMLCanvasElement>(null);
  const [gameRoomState, setGameRoomState] = useState<GameRoomState>();
  const [upState, setUpState] = useState<boolean>(false);
  const [downState, setDownState] = useState<boolean>(false);

  useEffect(() => {
    if (upState) {
      gameSocket?.emit('keydown', { roomId: gameRoomState?.roomId, code: -1 });
    } else {
      gameSocket?.emit('keyup', { roomId: gameRoomState?.roomId, code: -1 });
    }
  }, [upState]);

  useEffect(() => {
    if (downState) {
      gameSocket?.emit('keydown', { roomId: gameRoomState?.roomId, code: 1 });
    } else {
      gameSocket?.emit('keyup', { roomId: gameRoomState?.roomId, code: 1 });
    }
  }, [downState]);

  useEffect(() => {
    const handleGameStateChange = (data: GameRoomState) => {
      setGameRoomState(data);
    };

    gameSocket?.on('game-state', handleGameStateChange);

    document.addEventListener('keydown', (key) => {
      if (key.repeat) return;
      if (key.keyCode === 38) {
        setUpState(true);
      } else if (key.keyCode === 40) {
        setDownState(true);
      }
    });

    document.addEventListener('keyup', (key) => {
      if (key.repeat) return;
      if (key.keyCode === 38) {
        setUpState(false);
      } else if (key.keyCode === 40) {
        setDownState(false);
      }
    });

    const cvs = ref.current;

    if (cvs) {
      const ctx = cvs.getContext('2d');
      if (ctx === null) return;

      cvs.width = GameInfo.width;
      cvs.height = GameInfo.height;

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
        ctx.font = '50px Arial, sans-serif';
        ctx.fillText(
          gameRoomState.score1.toString(),
          GameInfo.width / 4,
          GameInfo.height / 4,
        );
        ctx.fillText(
          gameRoomState.score2.toString(),
          (GameInfo.width / 4) * 3,
          GameInfo.height / 4,
        );
        ctx.fillRect(
          0,
          (GameInfo.height - GameInfo.paddleY) / 2 + gameRoomState.paddle1,
          GameInfo.paddleX,
          GameInfo.paddleY,
        );
        ctx.fillRect(
          GameInfo.width - GameInfo.paddleX,
          (GameInfo.height - GameInfo.paddleY) / 2 + gameRoomState.paddle2,
          GameInfo.paddleX,
          GameInfo.paddleY,
        );
        ctx.beginPath();
        ctx.arc(
          gameRoomState.ballx + GameInfo.width / 2,
          gameRoomState.bally + GameInfo.height / 2,
          GameInfo.ballr,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.closePath();
      }

      ctx.stroke();
    }
  }, [gameSocket, gameRoomState]);

  return (
    <div className="flex items-center justify-center">
      <canvas ref={ref} width={GameInfo.width} height={GameInfo.height} />
    </div>
  );
};

export default GameStart;
