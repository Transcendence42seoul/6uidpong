import React from 'react';

import HoverButton from '../components/button/HoverButton';

const Login: React.FC = () => {
  const handleLoginClick = () => {
    window.location.href =
      'https://localhost/api/v1/auth/social/redirect/forty-two';
  };

  return (
    <>
      <h1 className="mt-0 pt-14 text-center text-3xl text-white">6u!dpong</h1>
      <div className="flex items-center justify-center">
        <HoverButton
          onClick={handleLoginClick}
          className="mt-5 border-2 px-5 py-2.5"
        >
          42 LOGIN
        </HoverButton>
      </div>
    </>
  );
};

export default Login;
