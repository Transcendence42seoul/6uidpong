import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert';

import ContentBox from '../components/common/ContentBox';
import HoverButton from '../components/common/HoverButton';
import UserProfile from '../components/common/UserProfile';
import SocketContext from '../context/SocketContext';
import selectAuth from '../features/auth/authSelector';

import type Game from '../interfaces/Game';

const GameRoom: React.FC = () => {
  const location = useLocation();
  const { game } = location.state;
  const navigate = useNavigate();

  const { gameId: roomIdString } = useParams<{ gameId: string }>();
  const roomId = Number(roomIdString);
  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { gameSocket } = useContext(SocketContext);

  const isStart = useRef<boolean>(false);
  const [gameStart, setGameStart] = useState<boolean>(true);
  const [mode, setMode] = useState<boolean>(false);
  const [room, setRoom] = useState<Game>(game);
  const [isDisabled, setIsdisabled] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (!isStart.current) gameSocket?.emit('exit-custom-room', roomId);
    };
  }, []);

  const exitGame = () => {
    setGameStart(false);
  };

  const startGame = () => {
    if (!room.participantId) {
      setShowAlert(true);
      return;
    }
    isStart.current = true;
    const { masterId, participantId } = room;
    navigate('/game-start', {
      state: { roomId, user1Id: masterId, user2Id: participantId },
    });
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
    const newMode = !mode;
    setMode(newMode);
    const roomInfo = { roomId, newMode };
    gameSocket?.emit('change-mode', roomInfo);
  };

  useEffect(() => {
    const handleChangeMode = (updateMode: boolean) => {
      setMode(updateMode);
    };
    gameSocket?.on('change-mode', handleChangeMode);
    return () => {
      gameSocket?.off('change-mode', handleChangeMode);
    };
  }, [mode]);

  useEffect(() => {
    if (myId !== room.masterId) {
      setIsdisabled(true);
    }
  }, [isDisabled]);

  useEffect(() => {
    const roomHandler = (updatedRoom: Game) => {
      setRoom({ ...updatedRoom });
      console.log(room);
    };
    gameSocket?.on('game-start', startGame);
    gameSocket?.on('room-destroyed', exitGame);
    gameSocket?.on('invite-dismissed', exitGame);
    gameSocket?.on('user-exit', roomHandler);
    gameSocket?.on('user-join', roomHandler);
    return () => {
      gameSocket?.off('game-start', startGame);
      gameSocket?.off('invite-dismissed', exitGame);
      gameSocket?.off('room-destroyed', exitGame);
      gameSocket?.off('user-exit', roomHandler);
      gameSocket?.off('user-join', roomHandler);
    };
  }, [gameSocket, room, setRoom]);

  useEffect(() => {
    if (!gameStart) {
      gameSocket?.emit('exit-custom-room', roomId);
      navigate('/custom');
    }
  }, [gameSocket, gameStart]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <ContentBox className="space-y-4 rounded-none border-2 bg-black p-4">
        <h2 className="text-lg font-semibold">{room.title}</h2>
        <div className="flex items-center justify-between">
          <UserProfile userId={room.masterId} stats />
          <span className="text-lg">vs</span>
          <UserProfile userId={room.participantId} stats />
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
                  disabled={isDisabled}
                  onChange={handleToggleChange}
                />
                <div
                  className={`h-7 w-12 rounded-full transition ${
                    mode ? 'bg-red-300' : 'bg-blue-300'
                  }`}
                />
                <div
                  className={`dot absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${
                    mode && 'translate-x-full transform'
                  }`}
                />
              </div>
            </label>
            <span>Destroy</span>
          </div>
          <div className="space-x-2">
            <HoverButton
              className="border p-2"
              onClick={handleStartClick}
              disabled={isDisabled}
            >
              Start
            </HoverButton>
            <HoverButton className="border p-2" onClick={handleExitClick}>
              Exit
            </HoverButton>
          </div>
        </div>
      </ContentBox>
      {showAlert && (
        <Alert message="User is not full" setShowAlert={setShowAlert} />
      )}
    </div>
  );
};

export default GameRoom;
