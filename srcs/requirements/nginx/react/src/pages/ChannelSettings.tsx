import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ChannelManagePanel from '../components/channel/ChannelManagePanel';
import ContentBox from '../components/common/ContentBox';
import HoverButton from '../components/common/HoverButton';
import ToggleSwitch from '../components/common/ToggleSwitch';
import selectSocket from '../features/socket/socketSelector';

import type Channel from '../interfaces/Channel';

const ChannelSettings: React.FC = () => {
  const { state } = useLocation();
  const channelId = state?.channelId;
  const role = state?.role;

  const navigate = useNavigate();

  const { socket } = selectSocket();

  const [isPasswordEnabled, setIsPasswordEnabled] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

  const handleCancelClick = () => {
    navigate(-1);
  };

  const handleConfirmClick = async () => {
    if (channelId) {
      const updatePasswordData = {
        channelId,
        password,
      };
      socket?.emit('update-password', updatePasswordData);
      return;
    }
    const channel = {
      title,
      password: isPasswordEnabled ? password : undefined,
      isPublic,
    };
    const channelHandler = ({ id }: Channel) => {
      navigate(`/channel/${id}`, {
        state: { password },
      });
    };
    socket?.emit('create-channel', channel, channelHandler);
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
    if (channelId || warning) return;
    const duplicateHandler = (isDuplicated: boolean) => {
      if (isDuplicated) {
        setWarning('That title is taken. Try another.');
      }
    };
    socket?.emit('channel-title-duplicated', title, duplicateHandler);
  }, [warning]);

  useEffect(() => {
    if (channelId || !title) return;
    const timeoutId = setTimeout(() => {
      const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
      if (!regex.test(title)) {
        setWarning(
          'Sorry, only letters(English), numbers and special charaters are allowed.',
        );
      } else if (title.length < 4 || title.length > 30) {
        setWarning(
          'Sorry, the channel title must be between 4 and 30 characters.',
        );
      } else {
        setWarning('');
      }
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [title]);

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      <ContentBox className="max-w-md space-y-6 bg-black px-6 pb-5 pt-4">
        {!channelId && (
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
        )}
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
        {!channelId && (
          <ToggleSwitch
            checked={!isPublic}
            leftText="Public"
            rightText="Private"
            setChecked={setIsPublic}
            color
          />
        )}
        <div className="flex space-x-4">
          <HoverButton
            onClick={handleConfirmClick}
            className="border bg-blue-800 p-2 hover:text-blue-800"
            disabled={!!warning}
          >
            Confirm
          </HoverButton>
          <HoverButton onClick={handleCancelClick} className="border p-2">
            Cancel
          </HoverButton>
        </div>
      </ContentBox>
      {channelId && <ChannelManagePanel channelId={channelId} role={role} />}
    </div>
  );
};

export default ChannelSettings;
