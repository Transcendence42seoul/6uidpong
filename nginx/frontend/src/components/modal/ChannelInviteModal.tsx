import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import SocketContext from '../../context/SocketContext';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../common/HoverButton';
import ModalContainer from '../container/ModalContainer';
import UserList from '../common/UserList';
import UserListWithSearchBar from '../common/UserListWithSearchBar';

import type Member from '../../interfaces/Member';
import type User from '../../interfaces/User';

interface ChannelInviteModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelInviteModal: React.FC<ChannelInviteModalProps> = ({
  setShowModal,
}) => {
  const callApi = useCallApi();

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = useContext(SocketContext);

  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [nonmembers, setNonmembers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<User>>(new Set());

  const fetchAllUsers = async () => {
    const config = {
      url: '/api/v1/users/search',
      params: { nickname: '' },
    };
    const { data: users } = await callApi(config);
    return users;
  };

  const fetchMemberIds = () => {
    const membersHandler = (members: Member[]) => {
      setMemberIds(members.map((member) => member.id));
    };
    socket?.emit('find-channel-users', { channelId }, membersHandler);
  };

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
    fetchMemberIds();
  }, []);

  useEffect(() => {
    if (memberIds.length === 0) return;
    const handleNonmembers = async () => {
      const users: User[] = await fetchAllUsers();
      setNonmembers([...users.filter((user) => !memberIds.includes(user.id))]);
    };
    handleNonmembers();
  }, [memberIds]);

  return (
    <ModalContainer setShowModal={setShowModal} className="flex space-x-8">
      <UserListWithSearchBar users={nonmembers} onUserClick={onUserClick} />
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
