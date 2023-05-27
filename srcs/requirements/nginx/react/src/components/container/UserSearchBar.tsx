import React, { useRef, useState } from 'react';

import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

interface UserSearchBarProps {
  userList: User[];
  onUserClick: (user: User) => void;
  className?: string;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  userList,
  onUserClick,
  className = '',
}) => {
  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>(userList);

  const handleUserClick = (user: User) => {
    setSearch('');
    onUserClick(user);
  };

  const handleSearchResults = async (users: User[]) => {
    setSearchResults([...users]);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const keyword = event.target.value;
    setSearch(keyword);
    if (keyword) {
      const results = userList.filter((user) => {
        return user.nickname.startsWith(keyword);
      });
      await handleSearchResults(results);
    } else {
      await handleSearchResults(userList);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search users"
        value={search}
        onChange={handleSearchChange}
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

export default UserSearchBar;
