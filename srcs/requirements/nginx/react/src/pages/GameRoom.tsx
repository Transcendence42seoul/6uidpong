import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import UserProfile from '../components/container/UserProfile';
import { selectGameSocket } from '../features/socket/socketSelector';

import { Game } from '../interfaces/Game';

const GameRoom: React.FC = () => {
  const { state } = useLocation();
  const { game } = state;

  const navigate = useNavigate();

  const { gameId: roomIdString } = useParams<{ gameId: string }>();
  const roomId = Number(roomIdString);

  const { gameSocket } = selectGameSocket();

  const [room, setRoom] = useState<Game>(game);

  const exitGame = () => {
    navigate('/custom');
  };

  const handleStartClick = () => {};

  const handleExitClick = () => {
    exitGame();
  };

  useEffect(() => {
    const roomHandler = (updatedRoom: Game) => {
      setRoom({ ...updatedRoom });
    };
    gameSocket?.on('room-destroyed', exitGame);
    gameSocket?.on('user-exit', roomHandler);
    gameSocket?.on('user-join', roomHandler);
    return () => {
      gameSocket?.off('room-destroyed', exitGame);
      gameSocket?.off('user-exit', roomHandler);
      gameSocket?.off('user-join', roomHandler);
      gameSocket?.emit('exit-custom-room', roomId);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <ContentBox className="space-y-4 rounded-none border-2 p-4">
        <h2 className="text-lg font-semibold">{room.title}</h2>
        <div className="flex items-center justify-between">
          <UserProfile userId={room.masterId}> </UserProfile>
          <span className="text-lg">vs</span>
          {room.participantId && (
            <UserProfile userId={room.participantId}> </UserProfile>
          )}
        </div>
        <div className="flex space-x-2">
          <HoverButton className="border p-2" onClick={handleStartClick}>
            Start
          </HoverButton>
          <HoverButton className="border p-2" onClick={handleExitClick}>
            Exit
          </HoverButton>
        </div>
      </ContentBox>
    </div>
  );
};

export default GameRoom;
