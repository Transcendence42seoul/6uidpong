import React from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../button/HoverButton';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute right-0 top-0 m-4 flex space-x-4">
      <HoverButton
        onClick={() => navigate('/')}
        className="rounded border-2 p-2.5"
      >
        Home
      </HoverButton>
      <HoverButton
        onClick={() => navigate('/my-page')}
        className="rounded border-2 p-2.5"
      >
        My Page
      </HoverButton>
    </div>
  );
};

export default Header;
