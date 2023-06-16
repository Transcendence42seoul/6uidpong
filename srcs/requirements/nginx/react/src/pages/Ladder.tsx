import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ImageSrc from '../constants/ImageSrc';
import { selectGameSocket } from '../features/socket/socketSelector';

interface RoomInfo {
  user1Id: number;
  user2Id: number;
  user1Nickname: string;
  user2Nickname: string;
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

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
    gameSocket?.on('game-start', (roomInfo: RoomInfo) => {
      const { user1Id, user2Id } = roomInfo;
      navigate('/game-start', { state: { user1Id, user2Id } });
    });
    return () => clearInterval(interval);
  }, []);
  const formattedMinutes = minutes.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });
  const formattedSeconds = seconds.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });

  return (
    <div>
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
