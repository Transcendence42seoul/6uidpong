import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid';

import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import ContentBox from '../components/container/ContentBox';
import selectAuth from '../features/auth/authSelector';
import { selectGameSocket } from '../features/socket/socketSelector';
import useCallApi from '../utils/useCallApi';

import type User from '../interfaces/User';

import { isTest, mockGameHistory, mockUsers } from '../mock'; // test

interface GameStats {
  isLadder: boolean;
  winnerNickname: string;
  loserNickname: string;
  winnerImage: string;
  loserImage: string;
  winnerScore: number;
  loserScore: number;
  createdAt: string;
  endAt: string;
}

const MyPage: React.FC = () => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;
  const myNickname = isTest ? mockUsers[0].nickname : tokenInfo?.nickname; // test

  const { gameSocket } = selectGameSocket();

  const [gameHistory, setGameHistory] = useState<GameStats[]>([]);
  const [isLadder, setIsLadder] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const handleBlockListClick = () => navigate('/block-list');
  const handleChangeProfileClick = () => navigate('/profile-settings');
  const handleFriendsListClick = () => navigate('/friends-list');
  const handleToggleChange = () => setIsLadder(!isLadder);

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        url: `/api/v1/users/${myId}`,
      };
      const data: User = isTest ? mockUsers[0] : await callApi(config); // test
      setUser(data);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const gameHistoryHandler = (history: GameStats[]) => {
      setGameHistory([...history]);
    };
    gameSocket?.emit('find-matches', gameHistoryHandler);
    setGameHistory(isTest ? mockGameHistory : gameHistory); // test
  }, []);

  return (
    <div className="flex space-x-8 p-8">
      <div className="flex-col space-y-4">
        <ContentBox className="w-full max-w-md border p-4">
          <h2 className="mt-2 text-2xl font-semibold">
            {user?.nickname ?? 'Loading...'}
          </h2>
          <CircularImage
            src={user?.image}
            alt="Profile"
            className="m-7 h-80 w-80"
          />
        </ContentBox>
        <HoverButton
          onClick={handleChangeProfileClick}
          className="w-full max-w-md rounded border p-2.5"
        >
          Change Profile
        </HoverButton>
        <ContentBox className="w-full max-w-md border p-4">
          <h3 className="mb-2 text-xl font-semibold">Stats</h3>
          <p className="mb-1.5">Wins: {user?.winStat}</p>
          <p className="mb-1.5">Losses: {user?.loseStat}</p>
          <p>Ladder Score: {user?.ladderScore}</p>
        </ContentBox>
        <HoverButton
          onClick={handleFriendsListClick}
          className="w-full max-w-md rounded border p-2.5"
        >
          Friends List
        </HoverButton>
        <HoverButton
          onClick={handleBlockListClick}
          className="w-full max-w-md rounded border p-2.5"
        >
          Block List
        </HoverButton>
      </div>
      <div className="w-full text-gray-50">
        <div className="m-2 flex items-center space-x-2.5">
          <span>Ladder</span>
          <label htmlFor="toggle" className="flex cursor-pointer items-center">
            <div className="relative">
              <input
                type="checkbox"
                id="toggle"
                className="sr-only"
                checked={isLadder}
                onChange={handleToggleChange}
              />
              <div className="h-7 w-12 rounded bg-gray-300 transition" />
              <div
                className={`dot absolute left-1 top-1 h-5 w-5 rounded bg-[#211f20] transition ${
                  isLadder ? '' : 'translate-x-full transform'
                }`}
              />
            </div>
          </label>
          <span>Custom</span>
        </div>
        {gameHistory
          .filter((game) => game.isLadder === isLadder)
          .map((game) => {
            const {
              createdAt,
              loserImage,
              loserNickname,
              loserScore,
              winnerImage,
              winnerNickname,
              winnerScore,
            } = game;
            const myWin = myNickname === winnerNickname;
            return (
              <div
                key={createdAt}
                className={`flex items-center justify-center space-x-2.5 border p-2 ${
                  myWin ? 'bg-[#28344e]' : 'bg-[#59343b]'
                }`}
              >
                <p>{winnerNickname}</p>
                <CircularImage
                  src={winnerImage}
                  alt="Winner"
                  className="h-10 w-10"
                />
                <p>{winnerScore}</p>
                <p>:</p>
                <p>{loserScore}</p>
                <CircularImage
                  src={loserImage}
                  alt="Loser"
                  className="h-10 w-10"
                />
                <p>{loserNickname}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MyPage;
