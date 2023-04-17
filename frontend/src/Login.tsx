import React from 'react';
import Settings from './Settings';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div
      className="min-h-screen w-screen bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: `url(${Settings.BACKGROUND_IMAGE})` }}
    >
      <h1 className="mt-0 pt-14 text-center font-press-start-2p text-3xl text-white">
        6u!dpong
      </h1>
      <div className="flex items-center justify-center">
        <button
          className="text-l mt-5 cursor-pointer border-2 border-white bg-black px-5 py-2.5 font-press-start-2p text-white hover:bg-white hover:text-black"
          onClick={onLogin}
        >
          42 LOGIN
        </button>
      </div>
    </div>
  );
};

export default Login;
