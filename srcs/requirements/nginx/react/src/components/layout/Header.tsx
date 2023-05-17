import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallAPI from '../../api';
import { User } from '../../pages/UserProfile';
import HoverButton from '../button/HoverButton';

const Header: React.FC = () => {
  const callAPI = useCallAPI();
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);

  const handleClickHome = () => navigate('/');
  const handleClickMyPage = () => navigate('/my-page');
  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nickname = event.target.value;
    setSearch(nickname);
    const params = {
      nickname,
    };
    const data: User[] = await callAPI('/api/v1/users/search', params);
    setResults(data);
  };

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
          onChange={handleSearchChange}
          className="w-full rounded p-2"
        />
        {search && (
          <ul className="absolute z-10 rounded bg-white p-2 shadow-md">
            {results.map((result) => {
              const { nickname, image } = result;
              return (
                <li key={nickname} className="border-b border-gray-300 py-1">
                  {nickname}
                </li>
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
