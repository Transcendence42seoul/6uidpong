import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../App';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<string[]>([]);

  const onJoinRoom = useCallback(
    (roomName: string) => () => {
      socket.emit('join-room', roomName, () => {
        navigate(`/chat/${roomName}`);
      });
    },
    [navigate],
  );

  useEffect(() => {
    const roomListHandler = (roomList: string[]) => {
      setRooms(roomList);
    };

    socket.emit('room-list', roomListHandler);
    return () => {
      socket.off('room-list', roomListHandler);
    };
  }, []);
};

export default ChatList;
