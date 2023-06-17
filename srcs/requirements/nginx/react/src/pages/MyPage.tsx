import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid';

import CircularImage from '../components/common/CircularImage';
import ContentBox from '../components/common/ContentBox';
import HoverButton from '../components/common/HoverButton';
import ToggleSwitch from '../components/common/ToggleSwitch';
import selectAuth from '../features/auth/authSelector';
import { selectGameSocket } from '../features/socket/socketSelector';
import useCallApi from '../utils/useCallApi';

import type User from '../interfaces/User';

import { isTest, mockGameHistory } from '../mock'; // test

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

  const { gameSocket } = selectGameSocket();

  const [gameHistory, setGameHistory] = useState<GameStats[]>([]);
  const [isLadder, setIsLadder] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const handleBlockListClick = () => navigate('/block-list');
  const handleChangeProfileClick = () => navigate('/profile-settings');
  const handleFriendsListClick = () => navigate('/friends-list');

  useEffect(() => {
    const fetchMyInfo = async () => {
      const config = {
        url: `/api/v1/users/${myId}`,
      };
      const { data: myInfo } = await callApi(config);
      setUser(myInfo);
    };
    fetchMyInfo();
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
          <p className="mb-1.5">Win: {user?.winStat}</p>
          <p className="mb-1.5">Loss: {user?.loseStat}</p>
          <p>Ladder: {user?.ladderScore}</p>
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
        <ToggleSwitch
          checked={!isLadder}
          leftText="Ladder"
          rightText="Custom"
          setChecked={setIsLadder}
          className="m-2"
        />
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
            const myWin = user?.nickname === winnerNickname;
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
