import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import CircularImage from '../components/container/CircularImage';
import { Chat } from './ChatRoom';

interface ChatRoomListProps {
  socket: Socket;
}

interface Position {
  x: number;
  y: number;
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

  const menuRef = useRef<HTMLUListElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const addRoom = (room: Room) => {
    setRooms((prevRooms) => [...prevRooms, room]);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setShowMenu(true);
  };

  const handleClickDelete = (interlocutorId: number) => {
    socket.emit('delete-dm-room', { interlocutorId });
    setRooms([
      ...rooms.filter((room) => room.interlocutorId !== interlocutorId),
    ]);
    setShowMenu(false);
  };

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
      if (!roomToUpdate) {
        const newRoom = {
          roomId: chat.roomId,
          lastMessage: chat.message,
          lastMessageTime: chat.createdAt,
          interlocutor: chat.nickname,
          interlocutorId: chat.userId,
          interlocutorImage: chat.image,
          newMsgCount: 1,
        };
        addRoom(newRoom);
        return;
      }
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenu && !menuRef.current?.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold">Chat</h1>
      <ul className="w-full max-w-3xl">
        {rooms
          .sort(
            (lhs, rhs) =>
              new Date(rhs.lastMessageTime).getTime() -
              new Date(lhs.lastMessageTime).getTime(),
          )
          .map((room) => {
            const {
              roomId,
              lastMessage,
              lastMessageTime,
              interlocutor,
              interlocutorId,
              interlocutorImage,
              newMsgCount,
            } = room;
            const formattedTime = new Date(lastMessageTime).toLocaleTimeString(
              'ko-KR',
              {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              },
            );
            return (
              <li
                key={roomId}
                className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
                onContextMenu={handleContextMenu}
                onDoubleClick={() =>
                  navigate(`/chat/${roomId}`, {
                    state: { interlocutorId },
                  })
                }
              >
                {showMenu && (
                  <ul
                    ref={menuRef}
                    style={{
                      position: 'fixed',
                      top: menuPosition.y,
                      left: menuPosition.x,
                    }}
                  >
                    <button
                      className="cursor-pointer rounded border-4 border-red-400 bg-black p-1 text-white hover:text-red-400"
                      onClick={() => handleClickDelete(interlocutorId)}
                    >
                      Delete
                    </button>
                  </ul>
                )}
                <div className="flex items-center">
                  <CircularImage
                    src={interlocutorImage}
                    alt={interlocutor}
                    className="mr-2 h-10 w-10"
                  />
                  <div>
                    <span>{interlocutor}</span>
                    <p className="text-sm text-gray-600">{lastMessage}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {newMsgCount > 0 && (
                    <div className="mr-3 rounded-full bg-red-500 text-white">
                      {newMsgCount}
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
