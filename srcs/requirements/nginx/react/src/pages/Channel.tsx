import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import ChatRoom from '../components/container/ChatRoom';

interface LocationState {
  password: string | undefined;
}

const Channel: React.FC = () => {
  const location = useLocation();
  const { password }: LocationState = location.state; // test

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

  return <ChatRoom join={join} leave={leave} send={send} />;
};

export default Channel;
