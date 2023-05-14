import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import CircularImage from '../components/container/CircularImage';
import { Chat } from './ChatRoom';

interface ChatRoomListProps {
  socket: Socket;
}

interface Room {
  roomId: string;
  lastMessage: string;
  lastMessageTime: string;
  interlocutor: string;
  interlocutorId: number;
  interlocutorImage: string;
  newMsgCount: number;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const roomListHandler = (roomList: Room[]) => {
      setRooms(roomList);
    };
    socket.emit('find-dm-rooms', roomListHandler);
  }, []);

  useEffect(() => {
    const messageHandler = (chat: Chat) => {
      const roomToUpdate = rooms.find(
        (room) => room.interlocutorId === chat.userId,
      );
      if (!roomToUpdate) return;
      roomToUpdate.lastMessage = chat.message;
      roomToUpdate.lastMessageTime = chat.createdAt;
      roomToUpdate.newMsgCount += 1;
      setRooms([...rooms]);
    };
    socket.on('send-dm', messageHandler);
    return () => {
      socket.off('send-dm', messageHandler);
    };
  }, [rooms]);

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
              onDoubleClick={() =>
                navigate(`/chat/${room.roomId}`, {
                  state: { interlocutorId: room.interlocutorId },
                })
              }
            >
              <div className="flex items-center">
                <CircularImage
                  src={room.interlocutorImage}
                  alt="Interlocutor"
                  className="mr-2 h-10 w-10"
                />
                <div>
                  <span>{room.interlocutor}</span>
                  <p className="text-sm text-gray-600">{room.lastMessage}</p>
                </div>
              </div>
              <div className="flex items-center">
                {room.newMsgCount > 0 && (
                  <div className="mr-3 rounded-full bg-red-500 text-white">
                    {room.newMsgCount}
                  </div>
                )}
                <span className="text-sm text-gray-600">{formattedTime}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatRoomList;
