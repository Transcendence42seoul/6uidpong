import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import callAPI from '../api';
import ContentBox from '../components/box/ContentBox';
import HoverButton from '../components/button/HoverButton';

interface Profile {
  nickname: string;
  image: string;
}

interface Stats {
  wins: number;
  losses: number;
  ladderScore: number;
  recentHistory: string[];
}

interface MyPageProps {
  id: number;
  stats: Stats;
}

const MyPage: React.FC<MyPageProps> = ({ id, stats }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<Profile>(`/api/v1/users/${id}`);
      setProfile(response.data);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <ContentBox className="mb-4 w-full max-w-md border p-4">
        <h2 className="mt-2 text-2xl font-bold">
          {profile?.nickname ?? 'Loading...'}
        </h2>
        <img className="rounded-full p-7" src={profile?.image} alt="Profile" />
      </ContentBox>
      <HoverButton
        onClick={() => callAPI('/profile')}
        className="mb-4 w-full max-w-md rounded border p-2.5"
      >
        Change Profile
      </HoverButton>
      <ContentBox className="mb-4 w-full max-w-md border p-4">
        <h3 className="mb-2 text-xl font-bold">Stats</h3>
        <p className="mb-1.5">Wins: {stats.wins}</p>
        <p className="mb-1.5">Losses: {stats.losses}</p>
        <p>Ladder Score: {stats.ladderScore}</p>
      </ContentBox>
      <ContentBox className="w-full max-w-md border p-4">
        <h3 className="mb-3 text-xl font-bold">Recent History</h3>
        <ul className="flex">
          {stats.recentHistory.map((history) => (
            <li
              key={uuidv4()}
              className={`mb-1 px-2 ${
                history === 'Win' ? 'text-blue-500' : 'text-red-500'
              }`}
            >
              {history}
            </li>
          ))}
        </ul>
      </ContentBox>
    </div>
  );
};

export default MyPage;
