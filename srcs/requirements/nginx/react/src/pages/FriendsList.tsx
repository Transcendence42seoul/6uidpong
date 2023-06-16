import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CircularImage from '../components/common/CircularImage';
import HoverButton from '../components/common/HoverButton';
import ListTitle from '../components/common/ListTitle';
import ModalContainer from '../components/container/ModalContainer';
import UserProfile from '../components/common/UserProfile';
import selectAuth from '../features/auth/authSelector';
import useCallApi from '../utils/useCallApi';

import type Position from '../interfaces/Position';
import type User from '../interfaces/User';

const FriendsList: React.FC = () => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const menuRef = useRef<HTMLUListElement>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showUserProfileModal, setShowUserProfileModal] =
    useState<boolean>(false);

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

  const handleUserDoubleClick = ({ id }: User) => {
    setSelectedFriendId(id);
    setShowUserProfileModal(true);
  };

  useEffect(() => {
    const fetchFriends = async () => {
      const config = {
        url: `/api/v1/users/${myId}/friends`,
      };
      const { data: users } = await callApi(config);
      setFriends([...users]);
    };
    fetchFriends();
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
              onDoubleClick={() => handleUserDoubleClick(friend)}
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
                    className="rounded border-4 border-red-400 bg-black p-1 text-white hover:text-red-400"
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
      {selectedFriendId && showUserProfileModal && (
        <ModalContainer setShowModal={setShowUserProfileModal} closeButton>
          <UserProfile
            userId={selectedFriendId}
            className="border border-white"
            stats
            footer
          />
        </ModalContainer>
      )}
    </div>
  );
};

export default FriendsList;
