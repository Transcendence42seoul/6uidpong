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

  const handleClickHome = () => navigate('/');
  const handleClickMyPage = () => navigate('/my-page');
  const handleClickUser = (id: number) => {
    setSearch('');
    setShowSearchResults(false);
    navigate(`/profile/${id}`);
  };

  const handleClickSearch = () => setShowSearchResults(true);
  const handleChangeSearch = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nickname = event.target.value;
    setSearch(nickname);
    setShowSearchResults(!!nickname);
    const params = {
      nickname,
    };
    const data: User[] =
      (await callAPI('/api/v1/users/search', params)) ?? mockUsers; // test
    setSearchResults(data);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchResults &&
        !searchResultsRef.current?.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <div className="m-4 flex items-center justify-between">
      <HoverButton onClick={handleClickHome} className="rounded border-2 p-2.5">
        Home
      </HoverButton>
      <div className="relative w-[40%]">
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={handleChangeSearch}
          onClick={handleClickSearch}
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
                  className="flex border-b border-gray-300 py-1"
                  onClick={() => handleClickUser(id)}
                >
                  <CircularImage
                    src={image}
                    alt={nickname}
                    className="mr-2 h-6 w-6 align-bottom"
                  />
                  {nickname}
                </button>
              );
            })}
          </ul>
        )}
      </div>
      <HoverButton
        onClick={handleClickMyPage}
        className="rounded border-2 p-2.5"
      >
        My Page
      </HoverButton>
    </div>
  );
};

export default Header;
