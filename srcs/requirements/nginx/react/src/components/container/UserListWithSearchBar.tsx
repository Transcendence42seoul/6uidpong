import React, { useEffect, useRef, useState } from 'react';

import startsWithIgnoreCase from '../../utils/startsWithIgnoreCase';
import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

interface UserListWithSearchBarProps {
  users: User[];
  onUserClick: (user: User) => void;
  className?: string;
}

const UserListWithSearchBar: React.FC<UserListWithSearchBarProps> = ({
  users,
  onUserClick,
  className = '',
}) => {
  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [searchResults, setSearchResults] = useState<User[]>(users);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleUserClick = (user: User) => {
    setSearchTerm('');
    onUserClick(user);
  };

  const handleSearchResults = () => {
    const results = users.filter((user) => {
      return startsWithIgnoreCase(user.nickname, searchTerm);
    });
    setSearchResults([...results]);
  };

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    handleSearchResults();
  }, [searchTerm, users]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={handleSearchTermChange}
        className="w-full rounded border border-white p-2 shadow"
      />
      <ul
        className="absolute z-10 flex w-full flex-col rounded border-2 bg-white px-2.5 pb-2 pt-1.5 shadow-md"
        ref={searchResultsRef}
      >
        {searchResults.map((user) => {
          const { nickname, image } = user;
          return (
            <button
              key={nickname}
              className="flex space-x-2 border-b border-gray-300 py-1 hover:bg-gray-200"
              onClick={() => handleUserClick(user)}
            >
              <CircularImage
                src={image}
                alt={nickname}
                className="h-6 w-6 align-bottom"
              />
              <span className="w-[90%] truncate text-left">{nickname}</span>
            </button>
          );
        })}
      </ul>
    </div>
  );
};

export default UserListWithSearchBar;
