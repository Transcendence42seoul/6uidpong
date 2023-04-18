import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div>
      <h1 className="mt-0 pt-14 text-center text-3xl text-white">6u!dpong</h1>
      <div className="flex items-center justify-center">
        <button
          className="text-l mt-5 cursor-pointer border-2 border-white bg-black px-5 py-2.5 text-white hover:bg-white hover:text-black"
          onClick={onLogin}
        >
          42 LOGIN
        </button>
      </div>
    </div>
  );
};

export default Login;
