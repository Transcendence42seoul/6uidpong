import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallAPI from '../../api';
import { User } from '../../pages/UserProfile';
import HoverButton from '../button/HoverButton';
import CircularImage from '../container/CircularImage';
import { mockUsers } from '../../mock'; // test

const Header: React.FC = () => {
  const callAPI = useCallAPI();
  const navigate = useNavigate();

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handleHomeClick = () => navigate('/');
  const handleMyPageClick = () => navigate('/my-page');
  const handleSearchClick = () => setShowSearchResults(true);
  const handleUserClick = (id: number) => {
    setSearch('');
    setShowSearchResults(false);
    navigate(`/profile/${id}`);
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
    const params = {
      nickname,
    };
    const data: User[] =
      (await callAPI('/api/v1/users/search', params)) ?? mockUsers; // test
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
    <div className="flex items-center justify-between p-4">
      <HoverButton onClick={handleHomeClick} className="rounded border-2 p-2.5">
        Home
      </HoverButton>
      <div className="relative w-[40%]">
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
            className="absolute z-10 flex w-full flex-col rounded border-2 bg-black bg-white px-2.5 pb-2 pt-1.5 shadow-md"
            ref={searchResultsRef}
          >
            {searchResults.map((user) => {
              const { id, nickname, image } = user;
              return (
                <button
                  key={nickname}
                  className="flex space-x-2 border-b border-gray-300 py-1 hover:bg-gray-200"
                  onClick={() => handleUserClick(id)}
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
      <HoverButton
        onClick={handleMyPageClick}
        className="rounded border-2 p-2.5"
      >
        My Page
      </HoverButton>
    </div>
  );
};

export default Header;
