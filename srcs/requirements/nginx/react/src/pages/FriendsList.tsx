import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import useCallAPI from '../utils/api';
import { User } from './UserProfile';
import { mockUsers } from '../mock'; // test

interface FriendsListProps {
  myId: number;
}

const FriendsList: React.FC<FriendsListProps> = ({ myId }) => {
  const callAPI = useCallAPI();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<User[]>([]);

  const handleIncomingRequestsClick = () => {
    navigate(`/friend-requests/${myId}`);
  };

  const handleUserDoubleClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    const fetchFriendsData = async () => {
      const data: User[] =
        (await callAPI(`/api/v1/users/${myId}/friends`)) ?? mockUsers; // test
      setFriends(data);
    };
    fetchFriendsData();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex">
        <h2 className="text-2xl font-bold text-gray-100">Friends</h2>
        <HoverButton
          onClick={handleIncomingRequestsClick}
          className="ml-auto border p-1.5"
        >
          Incoming Requests
        </HoverButton>
      </div>
      <ul className="space-y-2">
        {friends.map((friend) => {
          const { id, nickname, image, status } = friend;
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
              <div className="ml-auto mr-3">
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
