import React, { useEffect, useRef, useState } from 'react';

import GameResultModal from '../components/modal/GameResultModal';
import { selectGameSocket } from '../features/socket/socketSelector';

import type GameState from '../interfaces/GameState';

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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [upState, setUpState] = useState<boolean>(false);
  const [downState, setDownState] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameState | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  useEffect(() => {
    const resultHandler = (result: GameState) => {
      setGameResult(result);
      setShowResultModal(true);
    };
    gameSocket?.on('game-end', resultHandler);
    return () => {
      gameSocket?.off('game-end', resultHandler);
    };
  }, []);

  useEffect(() => {
    if (upState) {
      gameSocket?.emit('keydown', { roomId: gameState?.roomId, code: -1 });
    } else {
      gameSocket?.emit('keyup', { roomId: gameState?.roomId, code: -1 });
    }
  }, [upState]);

  useEffect(() => {
    if (downState) {
      gameSocket?.emit('keydown', { roomId: gameState?.roomId, code: 1 });
    } else {
      gameSocket?.emit('keyup', { roomId: gameState?.roomId, code: 1 });
    }
  }, [downState]);

  useEffect(() => {
    const handleGameStateChange = (state: GameState) => {
      setGameState(state);
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

      if (gameState) {
        ctx.font = '50px Arial, sans-serif';
        ctx.fillText(
          gameState.score1.toString(),
          GameInfo.width / 4,
          GameInfo.height / 4,
        );
        ctx.fillText(
          gameState.score2.toString(),
          (GameInfo.width / 4) * 3,
          GameInfo.height / 4,
        );
        ctx.fillRect(
          0,
          (GameInfo.height - GameInfo.paddleY) / 2 + gameState.paddle1,
          GameInfo.paddleX,
          GameInfo.paddleY,
        );
        ctx.fillRect(
          GameInfo.width - GameInfo.paddleX,
          (GameInfo.height - GameInfo.paddleY) / 2 + gameState.paddle2,
          GameInfo.paddleX,
          GameInfo.paddleY,
        );
        ctx.beginPath();
        ctx.arc(
          gameState.ballx + GameInfo.width / 2,
          gameState.bally + GameInfo.height / 2,
          GameInfo.ballr,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.closePath();
      }

      ctx.stroke();
    }
  }, [gameSocket, gameState]);

  return (
    <div className="flex items-center justify-center">
      <canvas ref={ref} width={GameInfo.width} height={GameInfo.height} />
      {gameResult && showResultModal && (
        <GameResultModal
          gameResult={gameResult}
          setShowModal={setShowResultModal}
        />
      )}
    </div>
  );
};

export default GameStart;
