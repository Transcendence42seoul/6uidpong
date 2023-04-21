import React from 'react';
import HoverButton from '../components/button/HoverButton';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div>
      <h1 className="mt-0 pt-14 text-center text-3xl text-white">6u!dpong</h1>
      <div className="flex items-center justify-center">
        <HoverButton onClick={onLogin} className="mt-5 border-2 px-5 py-2.5">
          42 LOGIN
        </HoverButton>
      </div>
    </div>
  );
};

export default Login;
