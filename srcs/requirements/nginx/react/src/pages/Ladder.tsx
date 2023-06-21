import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ImageSrc from '../constants/ImageSrc';
import { selectGameSocket } from '../features/socket/socketSelector';
import GameState from '../interfaces/GameState';

const Ladder: React.FC = () => {
  const { gameSocket } = selectGameSocket();
  const [time, setTime] = useState({ minutes: 0, seconds: 0 });
  const { minutes, seconds } = time;
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        const newSeconds = prevTime.seconds + 1;
        const newMinutes = prevTime.minutes + Math.floor(newSeconds / 60);
        const updatedSeconds = newSeconds % 60;

        return { minutes: newMinutes, seconds: updatedSeconds };
      });
    }, 1000);

    gameSocket?.emit('ladder-game-match');
    gameSocket?.on('game-start', (roomInfo: GameState) => {
      const { roomId, user1Id, user2Id } = roomInfo;
      navigate('/game-start', { state: { roomId, user1Id, user2Id } });
    });
    return () => {
      clearInterval(interval);
      gameSocket?.off('game-start');
      gameSocket?.emit('ladder-game-match-cancel');
    };
  }, []);
  const formattedMinutes = minutes.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });
  const formattedSeconds = seconds.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex h-1/2 w-1/2 flex-col items-center justify-center border-4 border-white bg-black p-4 text-center text-white">
        <div className="mb-10 flex h-[60%] items-center justify-center">
          <img src={ImageSrc.MATCH_IMAGE} alt="MATCHING" className="h-full" />
        </div>
        <p className="mb-2 text-2xl">
          {formattedMinutes}:{formattedSeconds}
        </p>
        <p className="mb-2 text-2xl">waiting for challenger...</p>
      </div>
    </div>
  );
};

export default Ladder;
