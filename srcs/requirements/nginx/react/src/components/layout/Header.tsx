import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';
import UserSearchBar from '../container/UserSearchBar';

import type User from '../../interfaces/User';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] =
    useState<boolean>(false);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMyPageClick = () => {
    navigate('/my-page');
  };

  const onUserClick = ({ id }: User) => {
    setSelectedUserId(id);
    setShowUserProfileModal(true);
  };

  return (
    <div className="flex items-center justify-between p-4">
      <HoverButton onClick={handleHomeClick} className="border-2 p-2.5">
        Home
      </HoverButton>
      <UserSearchBar onUserClick={onUserClick} className="w-[40%]" />
      <HoverButton onClick={handleMyPageClick} className="border-2 p-2.5">
        My Page
      </HoverButton>
      {selectedUserId && showUserProfileModal && (
        <ModalContainer setShowModal={setShowUserProfileModal} closeButton>
          <UserProfile
            userId={selectedUserId}
            className="border border-white"
          />
        </ModalContainer>
      )}
    </div>
  );
};

export default Header;
