import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import UserProfile from '../components/container/UserProfile';
import { selectGameSocket } from '../features/socket/socketSelector';

import type Game from '../interfaces/Game';

const GameRoom: React.FC = () => {
  const { state } = useLocation();

  const navigate = useNavigate();

  const { gameId: roomIdString } = useParams<{ gameId: string }>();
  const roomId = Number(roomIdString);

  const { gameSocket } = selectGameSocket();

  const [gameStart, setGameStart] = useState<boolean>(true);
  const [mode, setMode] = useState<boolean>(false);
  const [room, setRoom] = useState<Game | undefined>(state?.game);

  const exitGame = () => {
    setGameStart(false);
  };

  const startGame = () => {
    navigate('/game-start');
  };

  const handleStartClick = () => {
    const roomInfo = { roomId, mode };
    gameSocket?.emit('start-custom-room', roomInfo);
    startGame();
  };

  const handleExitClick = () => {
    exitGame();
  };

  const handleToggleChange = () => {
    setMode(!mode);
  };

  useEffect(() => {
    const roomHandler = (updatedRoom: Game) => {
      setRoom({ ...updatedRoom });
    };
    gameSocket?.on('game-start', startGame);
    gameSocket?.on('room-destroyed', exitGame);
    gameSocket?.on('user-exit', roomHandler);
    gameSocket?.on('user-join', roomHandler);
    return () => {
      gameSocket?.off('game-start', startGame);
      gameSocket?.off('room-destroyed', exitGame);
      gameSocket?.off('user-exit', roomHandler);
      gameSocket?.off('user-join', roomHandler);
    };
  }, []);

  useEffect(() => {
    if (!gameStart) {
      gameSocket?.emit('exit-custom-room', roomId);
      navigate('/custom');
    }
  }, [gameStart]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <ContentBox className="space-y-4 rounded-none border-2 p-4">
        <h2 className="text-lg font-semibold">{room.title}</h2>
        <div className="flex items-center justify-between">
          <UserProfile userId={room.masterId}> </UserProfile>
          <span className="text-lg">vs</span>
          <UserProfile userId={room.participantId}> </UserProfile>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <span>Normal</span>
            <label
              htmlFor="toggle"
              className="flex cursor-pointer items-center"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="toggle"
                  className="sr-only"
                  checked={!mode}
                  onChange={handleToggleChange}
                />
                <div
                  className={`h-7 w-12 rounded-full transition ${
                    mode ? 'bg-red-300' : 'bg-blue-300'
                  }`}
                />
                <div
                  className={`dot absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${
                    mode ? 'translate-x-full transform' : ''
                  }`}
                />
              </div>
            </label>
            <span>Destroy</span>
          </div>
          <div className="space-x-2">
            <HoverButton className="border p-2" onClick={handleStartClick}>
              Start
            </HoverButton>
            <HoverButton className="border p-2" onClick={handleExitClick}>
              Exit
            </HoverButton>
          </div>
        </div>
      </ContentBox>
    </div>
  );
};

export default GameRoom;
