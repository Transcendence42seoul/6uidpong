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

import type Game from '../../interfaces/Game';
import type User from '../../interfaces/User';

interface UserProfileProps {
  userId: number | undefined;
  className?: string;
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  className = '',
  children = null,
}) => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { gameSocket } = selectGameSocket();
  const { socket } = selectSocket();

  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const handleBlockClick = () => {
    if (isBlocked) {
      socket?.emit('unblock', { interlocutorId: userId });
    } else {
      socket?.emit('block', { interlocutorId: userId });
    }
    setIsBlocked(!isBlocked);
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: number }) =>
      navigate(`/dm/${roomId}`, {
        state: { interlocutorId: userId },
      });
    socket?.emit('join-dm', { interlocutorId: userId }, roomIdHandler);
  };

  const handleFriendClick = () => {
    if (isFriend) {
      const config = {
        url: `/api/v1/users/${myId}/friends/${userId}`,
        method: 'delete',
      };
      callApi(config);
    } else {
      const config = {
        url: `/api/v1/users/${myId}/friend-requests`,
        method: 'post',
        data: { toId: userId },
      };
      callApi(config);
    }
  };

  const handleGameClick = () => {
    gameSocket?.emit('invite-game', userId);
  };

  useEffect(() => {
    const gameHandler = (game: Game) => {
      navigate(`/custom/${game.roomId}`, {
        state: { game },
      });
    };
    gameSocket?.on('invite-room-created', gameHandler);
    return () => {
      gameSocket?.off('invite-room-created', gameHandler);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsBlocked(user.isBlocked);
    setIsFriend(user.isFriend);
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        url: `/api/v1/users/${userId}`,
      };
      const data: User = await callApi(config);
      setUser(data);
    };
    if (!userId) {
      setUser(null);
      return;
    }
    fetchUserData();
  }, [userId]);

  return (
    <div className={className}>
      <ContentBox className="p-4">
        <h2
          className={`text-lg font-semibold ${
            user ? '' : 'text-white text-opacity-0'
          }`}
        >
          {user?.nickname ?? 'Waiting...'}
        </h2>
        <CircularImage
          src={user?.image}
          alt="Profile"
          className={`m-2.5 h-32 w-32 border ${
            user ? '' : 'bg-white bg-opacity-0 text-white text-opacity-0'
          }`}
        />
        {children ?? (
          <div>
            <p className="mt-1 text-sm">Wins: {user?.winStat}</p>
            <p className="mt-1 text-sm">Losses: {user?.loseStat}</p>
            <p className="mt-1 text-sm">Ladder Score: {user?.ladderScore}</p>
            <HoverButton
              onClick={handleFriendClick}
              className="mt-4 border-2 px-2 py-1"
            >
              {isFriend ? 'Delete Friend' : 'Friend Request'}
            </HoverButton>
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
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        )}
      </ContentBox>
    </div>
  );
};

export default UserProfile;
