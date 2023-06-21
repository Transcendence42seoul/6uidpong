import React from 'react';
import { useNavigate } from 'react-router-dom';

import ContentBox from '../components/common/ContentBox';
import HoverButton from '../components/common/HoverButton';
import ImageSrc from '../constants/ImageSrc';

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleChannelClick = () => navigate('/channel');
  const handleCustomClick = () => navigate('/custom');
  const handleDmClick = () => navigate('/dm');
  const handleLadderClick = () => navigate('/ladder');

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <div className="group relative mx-10 w-1/3">
        <ContentBox className="border-8 bg-black p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 group-hover:opacity-70">
          <img
            src={ImageSrc.GAME}
            alt="GAME"
            className="group-hover:opacity-0"
          />
          <h2 className="mt-7 text-4xl font-semibold group-hover:text-black group-hover:opacity-50">
            GAME
          </h2>
        </ContentBox>
        <div className="absolute inset-0 hidden flex-col justify-center space-y-10 group-hover:flex">
          <HoverButton
            onClick={handleCustomClick}
            className="h-1/4 w-full text-lg"
          >
            CUSTOM
          </HoverButton>
          <HoverButton
            onClick={handleLadderClick}
            className="h-1/4 w-full text-lg"
          >
            LADDER
          </HoverButton>
        </div>
      </div>
      <div className="group relative mx-10 w-1/3">
        <ContentBox className="border-8 bg-black p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 group-hover:opacity-70">
          <img
            src={ImageSrc.CHAT}
            alt="CHAT"
            className="group-hover:opacity-0"
          />
          <h2 className="mt-7 text-4xl font-semibold group-hover:text-black group-hover:opacity-50">
            CHAT
          </h2>
        </ContentBox>
        <div className="absolute inset-0 hidden flex-col justify-center space-y-10 group-hover:flex">
          <HoverButton onClick={handleDmClick} className="h-1/4 w-full text-lg">
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
