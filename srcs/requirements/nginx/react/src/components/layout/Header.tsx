import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';
import UserSearchBar from '../container/UserSearchBar';

import type User from '../../interfaces/User';

interface HeaderProps {
  socket: Socket;
}

const Header: React.FC<HeaderProps> = ({ socket }) => {
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] =
    useState<boolean>(false);

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
          <UserProfile user={selectedUser} socket={socket} />
        </ModalContainer>
      )}
    </div>
  );
};

export default Header;
