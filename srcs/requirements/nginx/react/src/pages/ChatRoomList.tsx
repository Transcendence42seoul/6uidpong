import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

export interface Chat {
  username: string;
  message: string;
  time: string;
}

interface ChatRoomListProps {
  socket: Socket;
}

interface Room {
  id: number;
  partner: number;
  lastChat: Chat;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);

  const onJoinRoom = useCallback(
    ({ id }: Room) =>
      () => {
        socket.emit('join-room', id, () => {
          navigate(`/chat/${id}`);
        });
      },
    [navigate],
  );

  useEffect(() => {
    const roomListHandler = (roomList: Room[]) => {
      setRooms(roomList);
    };

    socket.emit('room-list', roomListHandler);
    return () => {
      socket.off('room-list', roomListHandler);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-4xl font-bold">Chat</h1>
      <ul className="w-full max-w-md">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
          >
            <span>{room.partner}</span>
            <button
              className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
              onClick={onJoinRoom(room)}
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;
