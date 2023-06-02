import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';
import UserSearchBar from '../container/UserSearchBar';

import type User from '../../interfaces/User';

const Header: React.FC = () => {
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
          <UserProfile userId={selectedUser.id} />
        </ModalContainer>
      )}
    </div>
  );
};

export default Header;
