import React from 'react';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen w-screen items-center justify-center bg-black bg-cover bg-bottom bg-no-repeat font-press-start-2p text-white"
      style={{ backgroundImage: `url(${Settings.BACKGROUND_IMAGE})` }}
    >
      <button
        className="absolute right-0 top-0 m-4 rounded border border-white bg-black p-2.5 hover:bg-white hover:text-black"
        onClick={() => navigate('/my-page')}
      >
        My Page
      </button>
      <div className="group relative mx-10 w-1/3 text-center">
        <div className="border-8 border-white bg-black p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img
            src="https://cdn-icons-png.flaticon.com/512/746/746020.png"
            alt="GAME"
            onClick={() => navigate('/game')}
          />
          <h1 className="mt-7 font-press-start-2p text-4xl text-white group-hover:text-black">
            GAME
          </h1>
        </div>
      </div>
      <div className="group relative mx-10 w-1/3 text-center">
        <div className="border-8 border-white bg-black p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img
            src="https://cdn-icons-png.flaticon.com/512/465/465227.png"
            alt="CHAT"
            onClick={() => navigate('/chat')}
          />
          <h1 className="mt-7 font-press-start-2p text-4xl text-white group-hover:text-black">
            CHAT
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
