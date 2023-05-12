import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useCallAPI from '../api';

export interface User {
  nickname: string;
  image: string;
  winStat: number;
  loseStat: number;
  ladderScore: number;
}

const UserProfile: React.FC = () => {
  const callAPI = useCallAPI();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const data = await callAPI(`/api/v1/users/${userId}`);
      setUser(data);
    };
    fetchData();
  }, []);

  return (
    <div className="font-pixel flex flex-col items-center">
      <img className="h-32 w-32 rounded-full" src={user?.image} alt="Profile" />
      <h2 className="mt-4 text-lg font-semibold">
        {user?.nickname ?? 'Loading...'}
      </h2>
      <div className="mt-2 flex">
        <p className="mr-4 text-sm">Wins: {user?.winStat}</p>
        <p className="text-sm">Losses: {user?.loseStat}</p>
      </div>
      <p className="mt-2 text-sm">Ladder Score: {user?.ladderScore}</p>
      <div className="mt-4 flex">
        <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">
          Game
        </button>
        <button className="mr-2 rounded bg-green-500 px-4 py-2 text-white">
          DM
        </button>
        <button className="rounded bg-red-500 px-4 py-2 text-white">
          Block
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
