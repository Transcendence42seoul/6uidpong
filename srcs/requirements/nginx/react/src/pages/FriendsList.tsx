import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../components/button/HoverButton';
import CircularImage from '../components/container/CircularImage';
import ListTitle from '../components/container/ListTitle';
import selectAuth from '../features/auth/authSelector';
import useCallApi from '../utils/useCallApi';
import type Position from '../interfaces/Position';
import type User from '../interfaces/User';
import { isTest, mockUsers } from '../mock'; // test

const FriendsList: React.FC = () => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const menuRef = useRef<HTMLUListElement>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setShowMenu(true);
  };

  const handleDeleteClick = (friendId: number) => {
    const config = {
      url: `/api/v1/users/${myId}/friends/${friendId}`,
      method: 'delete',
    };
    callApi(config);
    setFriends([...friends.filter((friend) => friend.id !== friendId)]);
    setShowMenu(false);
  };

  const handleIncomingRequestsClick = () => {
    navigate('/friend-requests');
  };

  const handleUserDoubleClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    const fetchFriendsData = async () => {
      const config = {
        url: `/api/v1/users/${myId}/friends`,
      };
      const data: User[] = isTest ? mockUsers : await callApi(config); // test
      setFriends([...data]);
    };
    fetchFriendsData();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-end">
        <ListTitle className="ml-2 text-gray-100">Friends</ListTitle>
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
              onContextMenu={handleContextMenu}
              onDoubleClick={() => handleUserDoubleClick(id)}
            >
              {showMenu && (
                <ul
                  ref={menuRef}
                  style={{
                    position: 'fixed',
                    top: menuPosition.y,
                    left: menuPosition.x,
                  }}
                >
                  <button
                    className="cursor-pointer rounded border-4 border-red-400 bg-black p-1 text-white hover:text-red-400"
                    onClick={() => handleDeleteClick(id)}
                  >
                    Delete
                  </button>
                </ul>
              )}
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
