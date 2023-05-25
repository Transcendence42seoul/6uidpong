import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ChatRoom from '../components/container/ChatRoom';

interface ChannelProps {
  socket: Socket;
}

interface LocationState {
  password: string | undefined;
}

const Channel: React.FC<ChannelProps> = ({ socket }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { password }: LocationState = state;

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const join = {
    name: 'join-channel',
    data: { info: { channelId, password } },
  };

  const leave = {
    name: 'leave-channel',
    data: { channelId },
  };

  const send = {
    name: 'send-channel-message',
    data: { toId: channelId },
  };

  const handleSettingsClick = () => {
    navigate('/channel-settings', {
      state: { channelId },
    });
  };

  const handleInviteClick = () => {};

  return (
    <>
      <div className="flex justify-end space-x-1.5 px-4">
        <HoverButton
          onClick={handleInviteClick}
          className="rounded border bg-sky-700 p-1.5"
        >
          Invite
        </HoverButton>
        <HoverButton
          onClick={handleSettingsClick}
          className="rounded border p-1.5"
        >
          Settings
        </HoverButton>
      </div>
      <ChatRoom join={join} leave={leave} send={send} socket={socket} />
    </>
  );
};

export default Channel;
