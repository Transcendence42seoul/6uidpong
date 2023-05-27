import React from 'react';

import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

interface UserListProps {
  title: string;
  users: Set<User> | User[];
  children?: React.ReactNode;
}

const UserList: React.FC<UserListProps> = ({
  title,
  users,
  children = null,
}) => {
  return (
    <div>
      <h1 className="m-1 text-lg font-semibold text-white">{title}</h1>
      <ul>
        {[...users].map((user) => {
          const { id, nickname, image } = user;
          return (
            <li
              key={id}
              className="flex items-center space-x-2.5 border-b bg-white px-3 py-2"
            >
              <CircularImage src={image} alt={nickname} className="h-6 w-6" />
              <span className="text-sm">{nickname}</span>
            </li>
          );
        })}
      </ul>
      {children}
    </div>
  );
};

export default UserList;
