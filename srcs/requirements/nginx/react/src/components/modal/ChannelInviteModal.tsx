import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserList from '../container/UserList';
import UserListWithSearchBar from '../container/UserListWithSearchBar';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test

interface ChannelInviteModalProps {
  channelId: number;
  setShowModal: (showModal: boolean) => void;
  socket: Socket;
}

const ChannelInviteModal: React.FC<ChannelInviteModalProps> = ({
  channelId,
  setShowModal,
  socket,
}) => {
  const callApi = useCallApi();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<User>>(new Set());

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    const inviteChannelData = {
      info: {
        channelId,
        userId: [...selectedUsers].map((user) => user.id),
      },
    };
    socket.emit('invite-channel', inviteChannelData);
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
    <ModalContainer>
      <UserListWithSearchBar users={allUsers} onUserClick={onUserClick} />
      <UserList title="Invite" users={selectedUsers}>
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
      </UserList>
    </ModalContainer>
  );
};

export default ChannelInviteModal;
