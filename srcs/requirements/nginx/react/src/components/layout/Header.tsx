import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../button/HoverButton';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const handleClickHome = () => navigate('/');
  const handleClickMyPage = () => navigate('/my-page');
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setResults([]);
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
            {results.map((result) => (
              <li key={result} className="border-b border-gray-300 py-1">
                {result}
              </li>
            ))}
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
