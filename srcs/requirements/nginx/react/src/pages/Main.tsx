import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentBox from '../components/box/ContentBox';
import HoverButton from '../components/button/HoverButton';
import Image from '../constants/Image';

const Main: React.FC = () => {
  const navigate = useNavigate();
  const callAPI = async () => {
    const url = new URL('https://localhost/api/v1/users/110729');
    try {
      await axios.get(url.pathname, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      axios.get('/api/v1/auth/token/refresh');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <HoverButton
        onClick={() => callAPI()}
        // onClick={() => navigate('/my-page')}
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
      <button className="group mx-10 w-1/3" onClick={() => navigate('/game')}>
        <ContentBox className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300">
          <img src={Image.CHAT} alt="CHAT" />
          <h1 className="mt-7 text-4xl group-hover:text-black">CHAT</h1>
        </ContentBox>
      </button>
    </div>
  );
};

export default Main;
