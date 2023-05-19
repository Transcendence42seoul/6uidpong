import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import CircularImage from '../components/container/CircularImage';
import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';
import useCallAPI from '../utils/api';
import { User } from './UserProfile';
import { mockFriendRequests } from '../mock'; // test

interface FriendRequest {
  from: User;
}

const FriendRequests: React.FC = () => {
  const callAPI = useCallAPI();
  const dispatch = useDispatch();

  const { accessToken, tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const handleAcceptClick = (fromId: number) => {
    try {
      axios.post(
        `/api/v1/users/${myId}/friends`,
        { friendId: fromId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      axios.delete(`/api/v1/users/${fromId}/friend-requests/${myId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRequests([...requests.filter(({ from }) => from.id !== fromId)]);
    } catch (error) {
      dispatchAuth(null, dispatch);
    }
  };

  const handleRejectClick = (fromId: number) => {
    try {
      axios.delete(`/api/v1/users/${fromId}/friend-requests/${myId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRequests([...requests.filter(({ from }) => from.id !== fromId)]);
    } catch (error) {
      dispatchAuth(null, dispatch);
    }
  };

  useEffect(() => {
    const fetchFriendRequestsData = async () => {
      const data: FriendRequest[] =
        (await callAPI(`/api/v1/users/${myId}/friend-requests`)) ??
        mockFriendRequests; // test
      setRequests(data);
    };
    fetchFriendRequestsData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold text-gray-100">Friend Requests</h2>
      <ul className="space-y-2">
        {requests.map((request) => {
          const { from } = request;
          const { id, nickname, image } = from;
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
