import React, { useEffect, useRef, useState } from 'react';

import useCallApi from '../../utils/useCallApi';
import CircularImage from './CircularImage';

import selectAuth from '../../features/auth/authSelector';

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
  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const callApi = useCallApi();

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handleUserClick = (user: User) => {
    onUserClick(user);
  };

  const handleShowSearchResults = () => {
    setShowSearchResults(!!search);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    const fetchUsersData = async () => {
      const config = {
        url: '/api/v1/users/search',
        params: { search },
      };
      const data: User[] = isTest ? mockUsers : await callApi(config); // test
      setSearchResults([...data.filter((user) => user.id !== myId)]);
    };
    fetchUsersData();
    handleShowSearchResults();
  }, [search]);

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
        onClick={handleShowSearchResults}
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
