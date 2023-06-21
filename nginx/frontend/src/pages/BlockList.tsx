import React, { useContext, useEffect, useState } from 'react';

import CircularImage from '../components/common/CircularImage';
import HoverButton from '../components/common/HoverButton';
import ListTitle from '../components/common/ListTitle';
import SocketContext from '../context/SocketContext';

import type User from '../interfaces/User';

const BlockList: React.FC = () => {
  const { socket } = useContext(SocketContext);

  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);

  const handleUnblockClick = (interlocutorId: number) => {
    socket?.emit('unblock', { interlocutorId });
    setBlockedUsers([
      ...blockedUsers.filter((user) => user.id !== interlocutorId),
    ]);
  };

  useEffect(() => {
    const blockListHandler = (blockList: User[]) => {
      setBlockedUsers([...blockList]);
    };
    socket?.emit('find-block-users', blockListHandler);
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
                className="ml-auto mr-2 rounded border px-4 py-2"
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
