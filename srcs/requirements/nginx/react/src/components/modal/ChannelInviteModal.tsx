import React, { useEffect, useState } from 'react';

import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import UserList from '../container/UserList';
import UserListWithSearchBar from '../container/UserListWithSearchBar';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test

interface ChannelInviteModalProps {
  onConfirmClick: (users: Set<User>) => void;
  setShowModal: (showModal: boolean) => void;
}

const ChannelInviteModal: React.FC<ChannelInviteModalProps> = ({
  onConfirmClick,
  setShowModal,
}) => {
  const callApi = useCallApi();

  const [allUsers, setAllUsers] = useState<User[]>([]);
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

  useEffect(() => {
    const fetchUsersData = async () => {
      const config = {
        url: '/api/v1/users',
      };
      const data: User[] = isTest ? mockUsers : await callApi(config); // test
      setAllUsers(data);
    };
    fetchUsersData();
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40">
      <UserListWithSearchBar users={allUsers} onUserClick={onUserClick} />
      <UserList title="Invite" users={selectedUsers} />
      <div className="flex">
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

export default ChannelInviteModal;
