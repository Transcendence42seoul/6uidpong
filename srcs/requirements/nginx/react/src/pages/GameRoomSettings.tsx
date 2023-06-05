import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import { selectGameSocket } from '../features/socket/socketSelector';

interface Game {
  roomId: number;
  p1Id: number;
  p2Id: number | null;
  mode: boolean;
}

const GameRoomSettings: React.FC = () => {
  const navigate = useNavigate();

  const { gameSocket } = selectGameSocket();

  const [isPasswordEnabled, setIsPasswordEnabled] = useState<boolean>(false);
  const [mode, setMode] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const handleCancelClick = () => {
    navigate(-1);
  };

  const handleConfirmClick = async () => {
    const roomInfo = {
      title,
      password: isPasswordEnabled ? password : null,
    };
    gameSocket?.emit('custom-game-create', roomInfo);
  };

  const handleEnablePasswordChange = () => {
    setIsPasswordEnabled(!isPasswordEnabled);
  };

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [],
  );

  const handleToggleChange = () => {
    setMode(!mode);
  };

  useEffect(() => {
    const gameRoomHandler = (game: Game) => {
      navigate(`/custom/${game.roomId}`, {
        state: { game },
      });
    };
    gameSocket?.on('custom-room-created', gameRoomHandler);
    return () => {
      gameSocket?.off('custom-room-created', gameRoomHandler);
    };
  }, []);

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      <ContentBox className="max-w-md space-y-6 px-6 pb-5 pt-4">
        <label htmlFor="title">
          Title
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className="focus:shadow-outline mt-2 w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none"
          />
        </label>
        <div className="space-y-2">
          <label htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={!isPasswordEnabled}
              className={`focus:shadow-outline mt-2 w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none ${
                !isPasswordEnabled && 'opacity-50'
              }`}
            />
          </label>
          <label
            htmlFor="enable-password"
            className="flex items-center justify-center"
          >
            <input
              type="checkbox"
              id="enable-password"
              checked={isPasswordEnabled}
              onChange={handleEnablePasswordChange}
              className="mr-2"
            />
            Enable
          </label>
        </div>
        <div className="flex items-center space-x-2.5">
          <span>Mode A</span>
          <label htmlFor="toggle" className="flex cursor-pointer items-center">
            <div className="relative">
              <input
                type="checkbox"
                id="toggle"
                className="sr-only"
                checked={mode}
                onChange={handleToggleChange}
              />
              <div
                className={`h-7 w-12 rounded-full transition ${
                  mode ? 'bg-blue-300' : 'bg-red-300'
                }`}
              />
              <div
                className={`dot absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${
                  mode ? '' : 'translate-x-full transform'
                }`}
              />
            </div>
          </label>
          <span>Mode B</span>
        </div>
        <div className="flex space-x-4">
          <HoverButton
            onClick={handleConfirmClick}
            className="border bg-blue-800 p-2 hover:text-blue-800"
          >
            Confirm
          </HoverButton>
          <HoverButton onClick={handleCancelClick} className="border p-2">
            Cancel
          </HoverButton>
        </div>
      </ContentBox>
    </div>
  );
};

export default GameRoomSettings;
