import React from 'react';

import HoverButton from './HoverButton';
import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

interface UserListProps {
  title: string;
  users: Set<User> | User[];
  onDeleteClick: (user: User) => void;
  children?: React.ReactNode;
}

const UserList: React.FC<UserListProps> = ({
  title,
  users,
  onDeleteClick,
  children = null,
}) => {
  const handleDeleteClick = (user: User) => {
    onDeleteClick(user);
  };

  return (
    <div>
      <h1 className="m-1 text-lg font-semibold text-white">{title}</h1>
      <ul>
        {[...users].map((user) => {
          const { id, nickname, image } = user;
          return (
            <li
              key={id}
              className="flex items-center justify-between space-x-2.5 border-b bg-white px-3 py-2"
            >
              <div className="flex items-center space-x-2.5">
                <CircularImage src={image} alt={nickname} className="h-6 w-6" />
                <span className="text-sm text-black">{nickname}</span>
              </div>
              <HoverButton
                onClick={() => handleDeleteClick(user)}
                className="h-4 w-4 rounded-full bg-red-600 text-xs font-bold hover:text-red-600"
              >
                -
              </HoverButton>
            </li>
          );
        })}
      </ul>
      {children}
    </div>
  );
};

export default UserList;
