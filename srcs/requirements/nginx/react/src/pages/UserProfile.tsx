import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import useCallAPI from '../api';
import AlertWithCloseButton from '../components/alert/AlertWithCloseButton';
import CircularImage from '../components/container/CircularImage';
import ContentBox from '../components/container/ContentBox';

export interface User {
  id: number;
  nickname: string;
  image: string;
  status: string;
  winStat: number;
  loseStat: number;
  ladderScore: number;
}

/* Mock User */
// export const user: User = {
//   id: 110729,
//   nickname: 'kijsong',
//   status: 'online',
//   image:
//     'https://cdn.intra.42.fr/users/a99b98748e81f651c11c5fa2ccbb753e/kijsong.jpg',
//   winStat: 4,
//   loseStat: 2,
//   ladderScore: 4242,
// };

interface UserProfileProps {
  socket: Socket;
}

const UserProfile: React.FC<UserProfileProps> = ({ socket }) => {
  const callAPI = useCallAPI();
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname } = location.state;
  const { userId } = useParams<{ userId: string }>();

  const [showAlert, setShowAlert] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const handleClickDM = () => {
    const roomIdHandler = ({ roomId }: { roomId: string }) =>
      navigate(`/chat/${roomId}`, {
        state: { interlocutorId: userId },
      });
    socket.emit('join-dm', { userId }, roomIdHandler);
  };

  const handleClickBlock = () => {
    socket.emit('block-dm-user', { userId });
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const params = {
        nickname,
      };
      const data: User[] = await callAPI('/api/v1/users/search', params);
      setUser(data[0]);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      return () => clearTimeout(timeoutId);
    }
  }, [showAlert]);

  return (
    <div className="flex flex-col items-center p-20">
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
        <div className="mt-4 flex">
          <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400">
            Game
          </button>
          <button
            className="mr-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-400"
            onClick={handleClickDM}
          >
            DM
          </button>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400"
            onClick={handleClickBlock}
          >
            Block
          </button>
        </div>
      </ContentBox>
      {showAlert && (
        <AlertWithCloseButton
          message={`${user?.nickname} is blocked.`}
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
};

export default UserProfile;
