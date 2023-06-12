import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import { selectGameSocket } from '../features/socket/socketSelector';

import type Game from '../interfaces/Game';

const GameRoomSettings: React.FC = () => {
  const navigate = useNavigate();

  const { gameSocket } = selectGameSocket();

  const [isPasswordEnabled, setIsPasswordEnabled] = useState<boolean>(false);
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
    gameSocket?.emit('create-custom-room', roomInfo);
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

  useEffect(() => {
    const gameHandler = (game: Game) => {
      navigate(`/custom/${game.roomId}`, {
        state: { game },
      });
    };
    gameSocket?.on('custom-room-created', gameHandler);
    return () => {
      gameSocket?.off('custom-room-created', gameHandler);
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
