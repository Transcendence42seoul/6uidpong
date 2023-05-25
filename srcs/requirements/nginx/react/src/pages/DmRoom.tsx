import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import ChatRoom from '../components/container/ChatRoom';

interface DmRoomProps {
  socket: Socket;
}

interface LocationState {
  interlocutorId: number;
}

const DmRoom: React.FC<DmRoomProps> = ({ socket }) => {
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
    data: { toId: interlocutorId },
  };

  return <ChatRoom join={join} leave={leave} send={send} socket={socket} />;
};

export default DmRoom;
