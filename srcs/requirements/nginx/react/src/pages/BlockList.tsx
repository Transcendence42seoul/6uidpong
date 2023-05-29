import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import ListTitle from '../components/container/ListTitle';

import type User from '../interfaces/User';

import { isTest, mockUsers } from '../mock'; // test

interface BlockListProps {
  socket: Socket;
}

const BlockList: React.FC<BlockListProps> = ({ socket }) => {
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);

  const handleUnblockClick = (interlocutorId: number) => {
    socket.emit('unblock', { interlocutorId });
    setBlockedUsers([
      ...blockedUsers.filter((user) => user.id !== interlocutorId),
    ]);
  };

  useEffect(() => {
    const blockListHandler = (blockList: User[]) => {
      setBlockedUsers([...blockList]);
    };
    socket.emit('find-block-users', blockListHandler);
    setBlockedUsers(isTest ? mockUsers : blockedUsers); // test
  }, []);

  return (
    <div className="p-4">
      <ListTitle className="mb-3.5 ml-2 text-gray-100">Blocklist</ListTitle>
      <ul className="space-y-2">
        {blockedUsers.map((user) => {
          const { id, nickname, image } = user;
          return (
            <li
              key={id}
              className="flex items-center border-2 border-white bg-black p-2"
            >
              <CircularImage
                src={image}
                alt={nickname}
                className="mr-4 h-12 w-12 rounded-full"
              />
              <span className="text-lg font-medium text-white">{nickname}</span>
              <HoverButton
                className="ml-auto mr-2 rounded px-4 py-2"
                onClick={() => handleUnblockClick(id)}
              >
                Unblock
              </HoverButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BlockList;
