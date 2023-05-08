import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../App';

const JoinChat: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<string[]>([]);

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
