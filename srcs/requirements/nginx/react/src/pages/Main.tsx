import React from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import Image from '../constants/Image';

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
      <button className="group mx-10 w-1/3" onClick={() => navigate('/game')}>
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img src={Image.GAME} alt="GAME" />
          <h1 className="mt-7 text-4xl group-hover:text-black">GAME</h1>
        </ContentBox>
      </button>
      <div className="group relative mx-10 w-1/3">
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 group-hover:opacity-70">
          <img src={Image.CHAT} alt="CHAT" />
          <h1 className="mt-7 text-4xl group-hover:text-black">CHAT</h1>
        </ContentBox>
        <div className="absolute inset-0 hidden flex-col justify-center group-hover:flex">
          <HoverButton
            onClick={() => navigate('/chat')}
            className="mb-10 h-1/4 w-full text-lg"
          >
            DM
          </HoverButton>
          <HoverButton
            onClick={() => navigate('/chat')}
            className="h-1/4 w-full text-lg"
          >
            CHANNEL
          </HoverButton>
        </div>
      </div>
    </div>
  );
};

export default Main;
