import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from './UserProfile';
import CircularImage from '../components/container/CircularImage';

const FriendList: React.FC = () => {
  const friends: User[] = [
    {
      id: 110729,
      nickname: 'kijsong',
      image:
        'https://cdn.intra.42.fr/users/a99b98748e81f651c11c5fa2ccbb753e/kijsong.jpg',
      status: 'online',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
    {
      id: 110731,
      nickname: 'yoson',
      image:
        'https://cdn.intra.42.fr/users/40840e98c56e893af845a7d2b05e631d/yoson.jpg',
      status: 'offline',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
    {
      id: 123456,
      nickname: 'wocheon',
      image:
        'https://cdn.intra.42.fr/users/bd9d267e40c02269bbdcd09fe4924419/wocheon.jpg',
      status: 'online',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold text-gray-100">Friends</h2>
      <ul className="space-y-2">
        {friends.map(({ id, nickname, image, status }) => {
          const statusColor =
            status === 'offline' ? 'bg-red-400' : 'bg-green-400';
          return (
            <li
              key={id}
              className="flex items-center border-2 border-white bg-black p-2"
              onDoubleClick={() => navigate(`/profile/${id}`)}
            >
              <CircularImage
                src={image}
                alt={nickname}
                className="mr-4 h-12 w-12 rounded-full"
              />
              <span className="text-lg font-medium text-white">{nickname}</span>
              <div className="ml-auto pr-3">
                <div className={`h-4 w-4 rounded-full ${statusColor}`} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendList;
