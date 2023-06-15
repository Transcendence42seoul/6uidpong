import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import selectSocket from '../../features/socket/socketSelector';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserList from '../container/UserList';
import UserListWithSearchBar from '../container/UserListWithSearchBar';

import type User from '../../interfaces/User';

interface ChannelInviteModalProps {
  setShowModal: (showModal: boolean) => void;
}

const ChannelInviteModal: React.FC<ChannelInviteModalProps> = ({
  setShowModal,
}) => {
  const callApi = useCallApi();

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = selectSocket();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<User>>(new Set());

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    const inviteChannelData = {
      info: {
        channelId,
        userIds: [...selectedUsers].map((user) => user.id),
      },
    };
    if (selectedUsers.size > 0) {
      socket?.emit('invite', inviteChannelData);
    }
    setShowModal(false);
  };

  const onDeleteClick = ({ id }: User) => {
    setSelectedUsers(
      (prevUsers) => new Set([...prevUsers].filter((user) => user.id !== id)),
    );
  };

  const onUserClick = (user: User) => {
    setSelectedUsers((prevUsers) => new Set(prevUsers).add(user));
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      const config = {
        url: '/api/v1/users/search',
        params: { nickname: '' },
      };
      const { data: users } = await callApi(config);
      setAllUsers([...users]);
    };
    fetchAllUsers();
  }, []);

  return (
    <ModalContainer setShowModal={setShowModal} className="flex space-x-8">
      <UserListWithSearchBar users={allUsers} onUserClick={onUserClick} />
      <UserList
        title="Invite"
        users={selectedUsers}
        onDeleteClick={onDeleteClick}
      >
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
