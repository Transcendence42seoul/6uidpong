import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import selectAuth from '../../features/auth/authSelector';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import CircularImage from './CircularImage';
import ContentBox from './ContentBox';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test

interface UserProfileProps {
  socket: Socket;
  children: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({ socket, children }) => {
  const callApi = useCallApi();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const interlocutorId = Number(userId);

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [user, setUser] = useState<User | null>(null);

  const handleBlockClick = () => {
    socket.emit('block-dm-user', { interlocutorId });
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: number }) =>
      navigate(`/dm/${roomId}`, {
        state: { interlocutorId },
      });
    socket.emit('join-dm', { interlocutorId }, roomIdHandler);
  };

  const handleFriendRequestClick = () => {
    const config = {
      url: `/api/v1/users/${myId}/friend-requests`,
      method: 'post',
      data: { toId: interlocutorId },
    };
    callApi(config);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        url: `/api/v1/users/${interlocutorId}`,
      };
      const data: User = isTest ? mockUsers[0] : await callApi(config); // test
      setUser(data);
    };
    fetchUserData();
  }, [interlocutorId]);

  return (
    <div className="flex flex-col items-center space-y-2 p-20">
      <ContentBox className="p-4">
        <h2 className="text-lg font-semibold">
          {user?.nickname ?? 'Loading...'}
        </h2>
        <CircularImage
          src={user?.image}
          alt="Profile"
          className="m-2.5 h-32 w-32"
        />
        <p className="mt-1 text-sm">Wins: {user?.winStat}</p>
        <p className="mt-1 text-sm">Losses: {user?.loseStat}</p>
        <p className="mt-1 text-sm">Ladder Score: {user?.ladderScore}</p>
        <HoverButton
          onClick={handleFriendRequestClick}
          className="mt-4 border-2 px-2 py-1"
        >
          Friend Request
        </HoverButton>
        <div className="mt-4 flex">
          <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400">
            Game
          </button>
          <button
            className="mr-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-400"
            onClick={handleDmClick}
          >
            DM
          </button>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400"
            onClick={handleBlockClick}
          >
            Block
          </button>
        </div>
      </ContentBox>
    </div>
  );
};

export default UserProfile;
