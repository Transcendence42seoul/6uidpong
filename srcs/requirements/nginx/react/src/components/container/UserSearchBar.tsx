import React, { useEffect, useRef, useState } from 'react';

import useCallApi from '../../utils/useCallApi';
import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test

interface UserSearchBarProps {
  onUserClick: (user: User) => void;
  className?: string;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  onUserClick,
  className = '',
}) => {
  const callApi = useCallApi();

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handleSearchClick = () => {
    setShowSearchResults(true);
  };

  const handleUserClick = (user: User) => {
    setSearch('');
    setShowSearchResults(false);
    onUserClick(user);
  };

  const handleSearchResults = async (data: User[]) => {
    setSearchResults([...data]);
  };

  const handleShowSearchResults = async (nickname: string) => {
    setShowSearchResults(!!nickname);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nickname = event.target.value;
    setSearch(nickname);
    const config = {
      url: '/api/v1/users/search',
      params: { nickname },
    };
    const data: User[] = isTest ? mockUsers : await callApi(config); // test
    await handleSearchResults(data);
    await handleShowSearchResults(nickname);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showSearchResults &&
        !searchResultsRef.current?.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showSearchResults]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search users"
        value={search}
        onChange={handleSearchChange}
        onClick={handleSearchClick}
        className="w-full rounded border border-white p-2 shadow"
      />
      {showSearchResults && (
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
      )}
    </div>
  );
};

export default UserSearchBar;
