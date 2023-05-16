import React from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../button/HoverButton';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleClickHome = () => navigate('/');
  const handleClickMyPage = () => navigate('/my-page');

  return (
    <div className="m-4 flex justify-end space-x-4">
      <HoverButton onClick={handleClickHome} className="rounded border-2 p-2.5">
        Home
      </HoverButton>
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
