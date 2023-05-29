import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';
import UserSearchBar from '../container/UserSearchBar';

import type User from '../../interfaces/User';
import useCallApi from '../../utils/useCallApi';
import selectAuth from '../../features/auth/authSelector';

interface HeaderProps {
  socket: Socket;
}

const Header: React.FC<HeaderProps> = ({ socket }) => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [interlocutorId, setInterlocutorId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] =
    useState<boolean>(false);

  const handleBlockClick = () => {
    socket.emit('block-dm-user', { interlocutorId });
  };

  const handleDmClick = () => {
    const roomIdHandler = ({ roomId }: { roomId: number }) =>
      navigate(`/dm/${roomId}`, {
        state: { interlocutorId },
      });
    socket.emit('join-dm', { interlocutorId }, roomIdHandler);
  };

  const handleFriendRequestClick = () => {
    const config = {
      url: `/api/v1/users/${myId}/friend-requests`,
      method: 'post',
      data: { toId: interlocutorId },
    };
    callApi(config);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMyPageClick = () => {
    navigate('/my-page');
  };

  const onUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserProfileModal(true);
  };

  useEffect(() => {
    if (!selectedUser) return;
    setInterlocutorId(selectedUser.id);
  }, [selectedUser]);

  return (
    <div className="flex items-center justify-between p-4">
      <HoverButton onClick={handleHomeClick} className="rounded border-2 p-2.5">
        Home
      </HoverButton>
      <UserSearchBar onUserClick={onUserClick} className="w-[40%]" />
      <HoverButton
        onClick={handleMyPageClick}
        className="rounded border-2 p-2.5"
      >
        My Page
      </HoverButton>
      {selectedUser && showUserProfileModal && (
        <ModalContainer setShowModal={setShowUserProfileModal} closeButton>
          <UserProfile user={selectedUser}>
            <p className="mt-1 text-sm">Wins: {selectedUser.winStat}</p>
            <p className="mt-1 text-sm">Losses: {selectedUser.loseStat}</p>
            <p className="mt-1 text-sm">
              Ladder Score: {selectedUser.ladderScore}
            </p>
            <HoverButton
              onClick={handleFriendRequestClick}
              className="mt-4 border-2 px-2 py-1"
            >
              Friend Request
            </HoverButton>
            <div className="mt-4 flex">
              <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400">
                Game
              </button>
              <button
                className="mr-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-400"
                onClick={handleDmClick}
              >
                DM
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400"
                onClick={handleBlockClick}
              >
                Block
              </button>
            </div>
          </UserProfile>
        </ModalContainer>
      )}
    </div>
  );
};

export default Header;
