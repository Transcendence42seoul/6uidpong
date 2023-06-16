import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import selectAuth from '../../features/auth/authSelector';
import selectSocket, {
  selectGameSocket,
} from '../../features/socket/socketSelector';
import useCallApi from '../../utils/useCallApi';
import HoverButton from './HoverButton';
import CircularImage from './CircularImage';
import ContentBox from './ContentBox';

import type Game from '../../interfaces/Game';
import type User from '../../interfaces/User';

interface UserProfileProps {
  userId: number | undefined;
  className?: string;
  stats?: boolean;
  footer?: boolean;
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  className = '',
  stats = false,
  footer = false,
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
      <ContentBox className="bg-[#211f20] pt-7">
        <CircularImage
          src={user?.image}
          alt="Profile"
          className={`h-32 w-32 border ${
            !user && 'bg-white bg-opacity-0 text-white text-opacity-0'
          }`}
        />
        <h2
          className={`text-md mx-3.5 mb-3.5 mt-2.5 font-semibold ${
            !user && 'text-white text-opacity-100'
          }`}
        >
          {user?.nickname ?? 'undefined-110729'}
        </h2>
        {stats && (
          <div className="mb-2 space-y-1 text-sm">
            <p>Wins: {user?.winStat}</p>
            <p>Losses: {user?.loseStat}</p>
            <p>Ladder: {user?.ladderScore}</p>
          </div>
        )}
        {children}
        {footer && (
          <div className="mt-2 text-sm">
            <HoverButton
              onClick={handleFriendClick}
              className="w-full border-y py-2"
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
