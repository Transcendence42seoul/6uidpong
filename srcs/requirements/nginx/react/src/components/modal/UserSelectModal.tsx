import React, { useState } from 'react';

import HoverButton from '../button/HoverButton';
import CircularImage from '../container/CircularImage';
import UserSearchBar from '../container/UserSearchBar';

import type User from '../../interfaces/User';

interface UserSelectModalProps {
  title: string;
  onConfirmClick: (users: Set<User>) => void;
  setShowModal: (showModal: boolean) => void;
}

const UserSelectModal: React.FC<UserSelectModalProps> = ({
  title,
  onConfirmClick,
  setShowModal,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<User>>(new Set());

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    onConfirmClick(selectedUsers);
    setShowModal(false);
  };

  const onUserClick = (user: User) => {
    setSelectedUsers((prevUsers) => new Set(prevUsers).add(user));
  };

  return (
    <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40">
      <UserSearchBar onUserClick={onUserClick} />
      <div>
        <h1 className="m-1 text-lg font-bold text-white">{title}</h1>
        <ul>
          {[...selectedUsers].map((user) => {
            const { id, nickname, image } = user;
            return (
              <li
                key={id}
                className="flex items-center space-x-2.5 border-b bg-white px-3 py-2"
              >
                <CircularImage src={image} alt={nickname} className="h-6 w-6" />
                <span className="text-sm">{nickname}</span>
              </li>
            );
          })}
        </ul>
        <HoverButton
          onClick={handleConfirmClick}
          className="border bg-blue-800 p-2 hover:text-blue-800"
        >
          Confirm
        </HoverButton>
        <HoverButton onClick={handleCancelClick} className="border p-2">
          Cancel
        </HoverButton>
      </div>
    </div>
  );
};

export default UserSelectModal;
