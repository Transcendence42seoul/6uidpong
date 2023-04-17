import React from 'react';
import Settings from './Settings';

interface Profile {
  nickname: string;
  picture: string;
}

interface Stats {
  wins: number;
  losses: number;
  ladderScore: number;
  recentHistory: string[];
}

interface MyPageProps {
  profile: Profile;
  stats: Stats;
}

const MyPage: React.FC<MyPageProps> = ({ profile, stats }) => {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center bg-cover bg-bottom bg-no-repeat p-4 font-press-start-2p text-white"
      style={{ backgroundImage: `url(${Settings.BACKGROUND_IMAGE})` }}
    >
      <div className="mb-4 flex w-full max-w-md flex-col items-center rounded border border-white bg-black p-4">
        <h2 className="mt-2 text-2xl font-bold">{profile.nickname}</h2>
        <img
          className="rounded-full p-7"
          src={profile.picture}
          alt="Profile Picture"
        />
      </div>
      <button className="mb-4 w-full max-w-md rounded border border-white bg-black p-2.5 text-white text-white hover:bg-white hover:text-black">
        Change Profile
      </button>
      <div className="mb-4 flex w-full max-w-md flex-col items-center rounded border border-white bg-black p-4">
        <h3 className="mb-2 text-xl font-bold">Stats</h3>
        <p className="mb-1.5">Wins: {stats.wins}</p>
        <p className="mb-1.5">Losses: {stats.losses}</p>
        <p>Ladder Score: {stats.ladderScore}</p>
      </div>
      <div className="flex w-full max-w-md flex-col items-center rounded border border-white bg-black p-4">
        <h3 className="mb-3 text-xl font-bold">Recent History</h3>
        <ul>
          {stats.recentHistory.map((history, index) => (
            <li key={index} className="mb-1">
              {history}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyPage;
