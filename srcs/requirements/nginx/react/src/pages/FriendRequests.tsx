import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CircularImage from '../components/common/CircularImage';
import HoverButton from '../components/common/HoverButton';
import ListTitle from '../components/common/ListTitle';
import selectAuth from '../features/auth/authSelector';
import useCallApi from '../utils/useCallApi';

import type User from '../interfaces/User';

const FriendRequests: React.FC = () => {
  const callApi = useCallApi();
  const navigate = useNavigate();

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

  const handleFriendsListClick = () => {
    navigate('/friends-list');
  };

  const handleRejectClick = (fromId: number) => {
    const config = {
      url: `/api/v1/users/${myId}/friend-requests/${fromId}`,
      method: 'delete',
    };
    callApi(config);
    setRequestUsers([...requestUsers.filter((user) => user.id !== fromId)]);
  };

  useEffect(() => {
    const fetchRequestUsers = async () => {
      const config = {
        url: `/api/v1/users/${myId}/friend-requests`,
      };
      const { data: users } = await callApi(config);
      setRequestUsers([...users]);
    };
    fetchRequestUsers();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-end">
        <ListTitle className="ml-2 text-gray-100">Friend Requests</ListTitle>
        <HoverButton
          onClick={handleFriendsListClick}
          className="ml-auto border p-1.5"
        >
          Incoming Requests
        </HoverButton>
      </div>
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
