import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface ChatRoomListProps {
  socket: Socket;
}

interface Room {
  roomId: number;
  lastMessage: string;
  lastMessageTime: string;
  interlocutor: string;
  interlocutorImage: string;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);

  const onEnterRoom = useCallback(
    ({ roomId }: Room) =>
      () => {
        socket.emit('enter-room', roomId, () => {
          navigate(`/chat/${roomId}`);
        });
      },
    [navigate],
  );

  useEffect(() => {
    const roomListHandler = (roomList: Room[]) => {
      setRooms(roomList);
    };

    socket.emit('dm-rooms', roomListHandler);
    return () => {
      socket.off('dm-rooms', roomListHandler);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold">Chat</h1>
      <ul className="w-full max-w-3xl">
        {rooms.map((room) => {
          const formattedTime = new Date(
            room.lastMessageTime,
          ).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });

          return (
            <li
              key={room.roomId}
              className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
              onDoubleClick={onEnterRoom(room)}
            >
              <div className="flex items-center">
                <img
                  src={room.interlocutorImage}
                  alt="Interlocutor"
                  className="mr-2 h-10 w-10 rounded-full"
                />
                <div>
                  <span>{room.interlocutor}</span>
                  <p className="text-sm text-gray-600">{room.lastMessage}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">{formattedTime}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatRoomList;
