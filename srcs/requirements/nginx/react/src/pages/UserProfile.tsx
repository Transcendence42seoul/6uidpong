import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import AlertWithCloseButton from '../components/alert/AlertWithCloseButton';
import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import ContentBox from '../components/container/ContentBox';
import selectAuth from '../features/auth/authSelector';
import useCallApi from '../utils/useCallApi';

export interface User {
  id: number;
  nickname: string;
  image: string;
  status: string;
  winStat: number;
  loseStat: number;
  ladderScore: number;
}

interface UserProfileProps {
  socket: Socket;
}

const UserProfile: React.FC<UserProfileProps> = ({ socket }) => {
  const callApi = useCallApi();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const interlocutorId = Number(userId);

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleBlockClick = () => {
    socket.emit('block-dm-user', { interlocutorId });
    setShowAlert(true);
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: string }) =>
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
      const data: User = await callApi(config);
      setUser(data);
    };
    fetchUserData();
  }, [interlocutorId]);

  useEffect(() => {
    if (showAlert) {
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      return () => clearTimeout(timeoutId);
    }
  }, [showAlert]);

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
      {showAlert && (
        <AlertWithCloseButton
          message={`${user?.nickname} is blocked.`}
          onClose={handleAlertClose}
        />
      )}
    </div>
  );
};

export default UserProfile;
