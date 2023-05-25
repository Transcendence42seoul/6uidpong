import React from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../button/HoverButton';

import UserSearchBar from '../container/UserSearchBar';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => navigate('/');
  const handleMyPageClick = () => navigate('/my-page');
  const onUserClick = (id: number) => navigate(`/profile/${id}`);

  return (
    <div className="flex items-center justify-between p-4">
      <HoverButton onClick={handleHomeClick} className="rounded border-2 p-2.5">
        Home
      </HoverButton>
      <UserSearchBar onUserClick={onUserClick} className="w-[40%]" />
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
