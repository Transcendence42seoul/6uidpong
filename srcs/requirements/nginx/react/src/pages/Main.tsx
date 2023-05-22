import React from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import Image from '../constants/Image';

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleChannelClick = () => navigate('/channel');
  const handleDmClick = () => navigate('/dm');
  const handleGameClick = () => navigate('/game');

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <button className="group mx-10 w-1/3" onClick={handleGameClick}>
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 group-hover:opacity-70">
          <img src={Image.GAME} alt="GAME" className="group-hover:opacity-0" />
          <h2 className="mt-7 text-4xl group-hover:text-black group-hover:opacity-50">
            GAME
          </h2>
        </ContentBox>
      </button>
      <div className="group relative mx-10 w-1/3">
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 group-hover:opacity-70">
          <img src={Image.CHAT} alt="CHAT" className="group-hover:opacity-0" />
          <h2 className="mt-7 text-4xl group-hover:text-black group-hover:opacity-50">
            CHAT
          </h2>
        </ContentBox>
        <div className="absolute inset-0 hidden flex-col justify-center group-hover:flex">
          <HoverButton
            onClick={handleDmClick}
            className="mb-10 h-1/4 w-full text-lg"
          >
            DM
          </HoverButton>
          <HoverButton
            onClick={handleChannelClick}
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
