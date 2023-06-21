import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameInfoModal from '../components/modal/GameOpponentModal';

import GameResultModal from '../components/modal/GameResultModal';
import SocketContext from '../context/SocketContext';

import type GameState from '../interfaces/GameState';

const GameInfo = {
  width: 1200,
  height: 800,
  paddleX: 15,
  paddleY: 120,
  maxY: (800 - 120) / 2,
  ballr: 15,
};

const GameStart: React.FC = () => {
  const { gameSocket } = useContext(SocketContext);

  const location = useLocation();
  const { roomId, user1Id, user2Id } = location.state;

  const ref = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [upState, setUpState] = useState<boolean>(false);
  const [downState, setDownState] = useState<boolean>(false);
  const [keyState, setKeyState] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameState | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const roomInfo = { roomId, user1Id, user2Id };

  useEffect(() => {
    if (gameSocket) {
      setShowInfoModal(true);
      setTimeout(() => {
        setShowInfoModal(false);
      }, 3000);
    }
    const resultHandler = (result: GameState) => {
      setGameResult(result);
      setShowResultModal(true);
    };

    gameSocket?.on('game-end', resultHandler);

    return () => {
      gameSocket?.off('game-end', resultHandler);
      if (!showResultModal) gameSocket?.emit('leave-game', roomInfo);
    };
  }, []);

  useEffect(() => {
    if (keyState) {
      if (upState) {
        const keyInfo = { roomId, message: 'arrowUp' };
        gameSocket?.emit('keyState', keyInfo);
      } else if (downState) {
        const keyInfo = { roomId, message: 'arrowDown' };
        gameSocket?.emit('keyState', keyInfo);
      }
    } else if (!keyState) {
      const keyInfo = { roomId, message: 'keyUnPressed' };
      gameSocket?.emit('keyState', keyInfo);
    }
  }, [keyState, upState, downState]);

  useEffect(() => {
    setKeyState(false);
    const keyInfo = { roomId, message: 'keyUnPressed' };
    gameSocket?.emit('keystate', keyInfo);
  }, [gameState?.score1, gameState?.score2]);

  useEffect(() => {
    document.addEventListener('keydown', (key) => {
      if (key.repeat) return;
      if (key.keyCode === 38) {
        setUpState(true);
        setKeyState(true);
      } else if (key.keyCode === 40) {
        setDownState(true);
        setKeyState(true);
      }
    });

    document.addEventListener('keyup', (key) => {
      if (key.repeat) return;
      if (key.keyCode === 38) {
        setUpState(false);
        setKeyState(false);
      } else if (key.keyCode === 40) {
        setDownState(false);
        setKeyState(false);
      }
    });
  }, [document]);

  useEffect(() => {
    const handleGameStateChange = (state: GameState) => {
      setGameState(state);
    };

    gameSocket?.on('game-state', handleGameStateChange);

    const cvs = ref.current;

    if (cvs) {
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

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
    return () => {
      gameSocket?.off('game-state');
    };
  }, [gameSocket, gameState]);

  return (
    <div className="flex items-center justify-center">
      {showInfoModal && (
        <GameInfoModal
          playerId={{ user1Id, user2Id }}
          setShowModal={setShowInfoModal}
        />
      )}
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
