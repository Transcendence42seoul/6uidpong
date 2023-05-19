import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircularImage from '../components/container/CircularImage';
import { mockUsers as users } from '../mock';

const FriendsList: React.FC = () => {
  const navigate = useNavigate();

  const handleUserDoubleClick = (id: number) => navigate(`/profile/${id}`);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold text-gray-100">Friends</h2>
      <ul className="space-y-2">
        {users.map(({ id, nickname, image, status }) => {
          const statusColor =
            status === 'offline' ? 'bg-red-400' : 'bg-green-400';
          return (
            <li
              key={id}
              className="flex items-center border-2 border-white bg-black p-2"
              onDoubleClick={() => handleUserDoubleClick(id)}
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

export default FriendsList;
