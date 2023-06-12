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
  const callApi = useCallApi();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handleUserClick = (user: User) => {
    onUserClick(user);
  };

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchResults = (users: User[]) => {
    const results = users.filter((user) => user.id !== myId);
    setSearchResults([...results]);
  };

  const handleShowSearchResults = () => {
    setShowSearchResults(!!searchTerm);
  };

  useEffect(() => {
    const fetchUsersData = async () => {
      const config = {
        url: '/api/v1/users/search',
        params: { nickname: searchTerm },
      };
      const data: User[] = isTest ? mockUsers : await callApi(config); // test
      handleSearchResults(data);
    };
    if (searchTerm) {
      fetchUsersData();
    }
    handleShowSearchResults();
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showSearchResults &&
        !searchResultsRef.current?.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showSearchResults]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={handleSearchTermChange}
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
