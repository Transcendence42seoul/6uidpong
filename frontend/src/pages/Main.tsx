import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentBox from '../components/box/ContentBox';
import HoverButton from '../components/button/HoverButton';

const Main: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <HoverButton
        onClick={() => navigate('/my-page')}
        className="absolute right-0 top-0 m-4 rounded border-2 p-2.5"
      >
        My Page
      </HoverButton>
      <div className="group mx-10 w-1/3">
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img
            src="https://cdn-icons-png.flaticon.com/512/746/746020.png"
            alt="GAME"
            onClick={() => navigate('/game')}
          />
          <h1 className="mt-7 text-4xl group-hover:text-black">GAME</h1>
        </ContentBox>
      </div>
      <div className="group mx-10 w-1/3">
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img
            src="https://cdn-icons-png.flaticon.com/512/465/465227.png"
            alt="CHAT"
            onClick={() => navigate('/chat')}
          />
          <h1 className="mt-7 text-4xl group-hover:text-black">CHAT</h1>
        </ContentBox>
      </div>
    </div>
  );
};

export default Main;
