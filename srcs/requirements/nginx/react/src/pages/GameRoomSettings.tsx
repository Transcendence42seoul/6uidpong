import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ContentBox from '../components/common/ContentBox';
import HoverButton from '../components/common/HoverButton';
import { selectGameSocket } from '../features/socket/socketSelector';

import type Game from '../interfaces/Game';

const GameRoomSettings: React.FC = () => {
  const navigate = useNavigate();

  const { gameSocket } = selectGameSocket();

  const [disabled, setDisabled] = useState<boolean>(true);
  const [isPasswordEnabled, setIsPasswordEnabled] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

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
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [gameSocket]);

  useEffect(() => {
    setDisabled(true);
    if (!title) return;
    const timeoutId = setTimeout(() => {
      const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
      if (!regex.test(title)) {
        setWarning(
          'Sorry, only letters(English), numbers and special charaters are allowed.',
        );
      } else if (title.length < 4 || title.length > 30) {
        setWarning(
          'Sorry, the game title must be between 4 and 30 characters.',
        );
      } else {
        setWarning('');
        setDisabled(false);
      }
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [title]);

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      <ContentBox className="max-w-md space-y-6 bg-black px-6 pb-5 pt-4">
        <label htmlFor="title" className="space-y-1.5">
          Title
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={`focus:shadow-outline mt-2 w-full rounded px-3 py-2 leading-tight text-gray-700 focus:outline-none ${
              warning ? 'border-2 border-red-500' : 'border'
            }`}
          />
          <p className="pl-2.5 text-left text-xs text-red-500">{warning}</p>
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
          <button
            onClick={handleConfirmClick}
            className={`border bg-blue-800 p-2 ${
              disabled ? 'text-gray-400' : 'hover:bg-white hover:text-blue-800'
            }`}
            disabled={disabled}
          >
            Confirm
          </button>
          <HoverButton onClick={handleCancelClick} className="border p-2">
            Cancel
          </HoverButton>
        </div>
      </ContentBox>
    </div>
  );
};

export default GameRoomSettings;
