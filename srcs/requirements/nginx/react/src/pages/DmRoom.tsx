import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import ChatRoom from '../components/container/ChatRoom';

interface LocationState {
  interlocutorId: number;
}

const DmRoom: React.FC = () => {
  const { state } = useLocation();
  const { interlocutorId }: LocationState = state;

  const { roomId: roomIdString } = useParams<{ roomId: string }>();
  const roomId = Number(roomIdString);

  const join = {
    name: 'join-dm',
    data: { interlocutorId },
  };

  const leave = {
    name: 'leave-dm',
    data: { roomId },
  };

  const send = {
    name: 'send-dm',
    data: { interlocutorId },
  };

  return <ChatRoom join={join} leave={leave} send={send} />;
};

export default DmRoom;
