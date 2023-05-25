import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import ChatRoom from '../components/container/ChatRoom';

interface ChannelProps {
  socket: Socket;
}

interface LocationState {
  password: string | undefined;
}

const Channel: React.FC<ChannelProps> = ({ socket }) => {
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

  return <ChatRoom join={join} leave={leave} send={send} socket={socket} />;
};

export default Channel;
