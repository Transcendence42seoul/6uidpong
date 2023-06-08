import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import selectAuth from '../../features/auth/authSelector';
import selectSocket, {
  selectGameSocket,
} from '../../features/socket/socketSelector';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import CircularImage from './CircularImage';
import ContentBox from './ContentBox';

import type User from '../../interfaces/User';

interface UserProfileProps {
  userId: number;
  friend?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  friend = false,
  className = '',
  children = null,
}) => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { gameSocket } = selectGameSocket();
  const { socket } = selectSocket();

  const [user, setUser] = useState<User | null>(null);

  const handleBlockClick = () => {
    socket?.emit('block', { interlocutorId: userId });
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: number }) =>
      navigate(`/dm/${roomId}`, {
        state: { interlocutorId: userId },
      });
    socket?.emit('join-dm', { interlocutorId: userId }, roomIdHandler);
  };

  const handleFriendRequestClick = () => {
    const config = {
      url: `/api/v1/users/${myId}/friend-requests`,
      method: 'post',
      data: { toId: userId },
    };
    callApi(config);
  };

  const handleGameClick = () => {
    gameSocket?.emit('invite-game', userId);
  };

  useEffect(() => {
    const gameIdHandler = (gameId: number) => {
      const game = {
        roomId: gameId,
        title: `${user?.nickname}'s game`,
        isLocked: true,
        masterId: myId,
      };
      navigate(`/custom/${gameId}`, {
        state: { game },
      });
    };
    gameSocket?.on('invite-room-created', gameIdHandler);
    return () => {
      gameSocket?.off('invite-room-created', gameIdHandler);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        url: `/api/v1/users/${userId}`,
      };
      const data: User = await callApi(config);
      setUser(data);
    };
    fetchUserData();
  }, []);

  return (
    <div className={className}>
      <ContentBox className="p-4">
        <h2 className="text-lg font-semibold">{user?.nickname}</h2>
        <CircularImage
          src={user?.image}
          alt="Profile"
          className="m-2.5 h-32 w-32"
        />
        {children ?? (
          <div>
            <p className="mt-1 text-sm">Wins: {user?.winStat}</p>
            <p className="mt-1 text-sm">Losses: {user?.loseStat}</p>
            <p className="mt-1 text-sm">Ladder Score: {user?.ladderScore}</p>
            {!friend && (
              <HoverButton
                onClick={handleFriendRequestClick}
                className="mt-4 border-2 px-2 py-1"
              >
                Friend Request
              </HoverButton>
            )}
            <div className="mt-4 flex">
              <button
                className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
                onClick={handleGameClick}
              >
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
