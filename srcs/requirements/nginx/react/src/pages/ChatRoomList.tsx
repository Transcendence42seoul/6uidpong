import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

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

  const onEnterRoom = useCallback(
    ({ id }: Room) =>
      () => {
        socket.emit('enter-room', id, () => {
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
            onDoubleClick={onEnterRoom(room)}
          >
            <div className="flex items-center">
              <img
                // src={}
                alt="PartnerImage"
                className="mr-2 h-10 w-10 rounded-full"
              />
              <div>
                <span>{room.partner}</span>
                <p className="text-sm text-gray-600">{room.lastChat.message}</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">{room.lastChat.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;
