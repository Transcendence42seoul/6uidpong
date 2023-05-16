import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import useCallAPI from '../api';
import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import ContentBox from '../components/container/ContentBox';
import { User } from './UserProfile';

interface Stats {
  recentHistory: string[];
}

interface MyPageProps {
  id: number;
  stats: Stats;
}

const MyPage: React.FC<MyPageProps> = ({ id, stats }) => {
  const callAPI = useCallAPI();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const handleClickChangeProfile = () => navigate('/profile-settings');
  const handleClickFriendsList = () => navigate('/friend-list');

  useEffect(() => {
    const fetchUserData = async () => {
      const data: User = await callAPI(`/api/v1/users/${id}`);
      setUser(data);
    };
    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <ContentBox className="w-full max-w-md border p-4">
        <h2 className="mt-2 text-2xl font-bold">
          {user?.nickname ?? 'Loading...'}
        </h2>
        <CircularImage
          src={user?.image}
          alt="Profile"
          className="m-7 h-80 w-80"
        />
      </ContentBox>
      <HoverButton
        onClick={handleClickChangeProfile}
        className="w-full max-w-md rounded border p-2.5"
      >
        Change Profile
      </HoverButton>
      <ContentBox className="w-full max-w-md border p-4">
        <h3 className="mb-2 text-xl font-bold">Stats</h3>
        <p className="mb-1.5">Wins: {user?.winStat}</p>
        <p className="mb-1.5">Losses: {user?.loseStat}</p>
        <p>Ladder Score: {user?.ladderScore}</p>
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
      <HoverButton
        onClick={handleClickFriendsList}
        className="w-full max-w-md rounded border p-2.5"
      >
        Friends List
      </HoverButton>
    </div>
  );
};

export default MyPage;
