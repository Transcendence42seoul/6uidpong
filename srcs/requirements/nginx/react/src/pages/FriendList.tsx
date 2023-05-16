import React from 'react';
import { User } from './UserProfile';
import CircularImage from '../components/container/CircularImage';

const FriendList: React.FC = () => {
  const friends: User[] = [
    {
      nickname: 'kijsong',
      image:
        'https://cdn.intra.42.fr/users/a99b98748e81f651c11c5fa2ccbb753e/kijsong.jpg',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
    {
      nickname: 'yoson',
      image:
        'https://cdn.intra.42.fr/users/40840e98c56e893af845a7d2b05e631d/yoson.jpg',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
    {
      nickname: 'wocheon',
      image:
        'https://cdn.intra.42.fr/users/bd9d267e40c02269bbdcd09fe4924419/wocheon.jpg',
      winStat: 1,
      loseStat: 1,
      ladderScore: 1000,
    },
  ];
  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold text-gray-100">Friends</h2>
      <ul className="space-y-2">
        {friends.map(({ nickname, image }) => (
          <li
            key={nickname}
            className="flex items-center border-2 border-white bg-black p-2"
          >
            <CircularImage
              src={image}
              alt={nickname}
              className="mr-4 h-12 w-12 rounded-full"
            />
            <span className="text-lg font-medium text-white">{nickname}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
