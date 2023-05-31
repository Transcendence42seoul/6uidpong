import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import selectAuth from '../../features/auth/authSelector';
import type User from '../../interfaces/User';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import CircularImage from './CircularImage';
import ContentBox from './ContentBox';

interface UserProfileProps {
  user: User;
  className?: string;
  socket?: Socket;
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  className = '',
  socket = null,
  children = null,
}) => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;
  const { id: interlocutorId, nickname, image } = user;

  const handleBlockClick = () => {
    socket?.emit('block', { interlocutorId });
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: number }) =>
      navigate(`/dm/${roomId}`, {
        state: { interlocutorId },
      });
    socket?.emit('join-dm', { interlocutorId }, roomIdHandler);
  };

  const handleFriendRequestClick = () => {
    const config = {
      url: `/api/v1/users/${myId}/friend-requests`,
      method: 'post',
      data: { toId: interlocutorId },
    };
    callApi(config);
  };

  return (
    <div className={className}>
      <ContentBox className="p-4">
        <h2 className="text-lg font-semibold">{nickname}</h2>
        <CircularImage src={image} alt={nickname} className="m-2.5 h-32 w-32" />
        {children ?? (
          <div>
            <p className="mt-1 text-sm">Wins: {user.winStat}</p>
            <p className="mt-1 text-sm">Losses: {user.loseStat}</p>
            <p className="mt-1 text-sm">Ladder Score: {user.ladderScore}</p>
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
          </div>
        )}
      </ContentBox>
    </div>
  );
};

export default UserProfile;
