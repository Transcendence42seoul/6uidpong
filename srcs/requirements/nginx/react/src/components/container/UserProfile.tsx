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
    const fetchUser = async () => {
      const config = {
        url: `/api/v1/users/${userId}`,
      };
      const { data } = await callApi(config);
      setUser(data);
    };
    if (!userId) {
      setUser(null);
      return;
    }
    fetchUser();
  }, [userId]);

  return (
    <div className={className}>
      <ContentBox className="bg-[#211f20] pt-4">
        <h2
          className={`text-lg font-semibold ${
            !user && 'text-white text-opacity-0'
          }`}
        >
          {user?.nickname ?? 'Waiting...'}
        </h2>
        <CircularImage
          src={user?.image}
          alt="Profile"
          className={`m-2.5 h-32 w-32 border ${
            !user && 'bg-white bg-opacity-0 text-white text-opacity-0'
          }`}
        />
        {children ?? (
          <div className="text-sm">
            <p className="mt-2">Wins: {user?.winStat}</p>
            <p className="mt-1">Losses: {user?.loseStat}</p>
            <p className="mt-1">Ladder Score: {user?.ladderScore}</p>
            <HoverButton
              onClick={handleFriendClick}
              className="mt-5 w-full border-y py-2"
            >
              {isFriend ? 'Delete Friend' : 'Friend Request'}
            </HoverButton>
            <div>
              <HoverButton className="px-4 py-2" onClick={handleGameClick}>
                Game
              </HoverButton>
              <HoverButton
                className="border-x px-4 py-2"
                onClick={handleDmClick}
              >
                DM
              </HoverButton>
              <HoverButton className="px-4 py-2" onClick={handleBlockClick}>
                {isBlocked ? 'Unblock' : 'Block'}
              </HoverButton>
            </div>
          </div>
        )}
      </ContentBox>
    </div>
  );
};

export default UserProfile;
