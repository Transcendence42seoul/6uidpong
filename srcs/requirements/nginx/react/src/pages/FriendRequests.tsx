import React, { useEffect, useState } from 'react';
import CircularImage from '../components/container/CircularImage';
import selectAuth from '../features/auth/authSelector';
import useCallApi from '../utils/useCallApi';
import { User } from './UserProfile';
import { mockFriendRequests } from '../mock'; // test

const FriendRequests: React.FC = () => {
  const callApi = useCallApi();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [requestUsers, setRequestUsers] = useState<User[]>([]);

  const handleAcceptClick = (friendId: number) => {
    const config = {
      url: `/api/v1/users/${myId}/friends`,
      method: 'post',
      data: { friendId },
    };
    callApi(config);
    setRequestUsers([...requestUsers.filter((user) => user.id !== friendId)]);
  };

  const handleRejectClick = (fromId: number) => {
    const config = {
      url: `/api/v1/users/${fromId}/friend-requests/${myId}`,
      method: 'delete',
    };
    callApi(config);
    setRequestUsers([...requestUsers.filter((user) => user.id !== fromId)]);
  };

  useEffect(() => {
    const fetchFriendRequestsData = async () => {
      const config = {
        url: `/api/v1/users/${myId}/friend-requests`,
      };
      const data: User[] = (await callApi(config)) ?? mockFriendRequests; // test
      setRequestUsers([...data]);
    };
    fetchFriendRequestsData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-100">Friend Requests</h1>
      <ul className="space-y-2">
        {requestUsers.map((user) => {
          const { id, nickname, image } = user;
          return (
            <li
              key={id}
              className="flex items-center border-2 border-white bg-black p-2"
            >
              <CircularImage
                src={image}
                alt={nickname}
                className="mr-4 h-12 w-12 rounded-full"
              />
              <span className="text-lg font-medium text-white">{nickname}</span>
              <div className="ml-auto flex">
                <button
                  className="mr-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-400"
                  onClick={() => handleAcceptClick(id)}
                >
                  Accept
                </button>
                <button
                  className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400"
                  onClick={() => handleRejectClick(id)}
                >
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendRequests;
