import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import CircularImage from '../container/CircularImage';
import ContentBox from '../container/ContentBox';
import UserListWithSeacrhBar from '../container/UserListWithSearchBar';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test
import UserList from '../container/UserList';

interface ChannelManageModalProps {
  channelId: number;
  setShowModal: (showModal: boolean) => void;
  socket: Socket;
}

interface SendData {
  info: {
    channelId: number;
    userId: number;
  };
}

const ChannelManageModal: React.FC<ChannelManageModalProps> = ({
  channelId,
  setShowModal,
  socket,
}) => {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [channelUsers, setChannelUsers] = useState<User[]>([]);
  const [owner, setOwner] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sendData, setSendData] = useState<SendData | null>(null);

  const removeUser = () => {
    setChannelUsers([
      ...channelUsers.filter((user) => user.id !== selectedUser?.id),
    ]);
  };

  const handleAssignAdminClick = () => {};

  const handleBanClick = () => {
    socket.emit('ban-channel-user', sendData);
    removeUser();
  };

  const handleCloseClick = () => {
    setShowModal(false);
  };

  const handleKickClick = () => {
    socket.emit('kick-channel-user', sendData);
    removeUser();
  };

  const handleMuteClick = () => {};

  const handleTransferOwnerClick = () => {
    socket.emit('transfer-ownership', sendData);
    setOwner(selectedUser);
  };

  const onUserClick = (user: User) => {
    setSelectedUser(user);
  };

  useEffect(() => {
    const channelAdminsHandler = (users: User[]) => {
      setAdminUsers([...users]);
    };
    socket.emit('find-channel-admins', { channelId }, channelAdminsHandler);
    setAdminUsers(isTest ? mockUsers : adminUsers); // test
  }, []);

  useEffect(() => {
    const bannedUsersHandler = (users: User[]) => {
      setBannedUsers([...users]);
    };
    socket.emit('find-channel-ban-users', { channelId }, bannedUsersHandler);
    setBannedUsers(isTest ? mockUsers : bannedUsers); // test
  }, []);

  useEffect(() => {
    const channelUsersHandler = (users: User[]) => {
      setChannelUsers([...users]);
    };
    socket.emit('find-channel-users', { channelId }, channelUsersHandler);
    setChannelUsers(isTest ? mockUsers : channelUsers); // test
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setSendData({
      info: {
        channelId,
        userId: selectedUser.id,
      },
    });
  }, [selectedUser]);

  return (
    <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40">
      <UserListWithSeacrhBar users={channelUsers} onUserClick={onUserClick} />
      {selectedUser && (
        <ContentBox className="max-h-96 max-w-xs border p-4">
          <h2 className="text-lg font-semibold">{selectedUser.nickname}</h2>
          <CircularImage
            src={selectedUser.image}
            alt={selectedUser.nickname}
            className="m-2 h-32 w-32"
          />
          <div className="m-4 flex w-full">
            <HoverButton
              onClick={handleMuteClick}
              className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
            >
              Mute
            </HoverButton>
            <HoverButton
              onClick={handleKickClick}
              className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
            >
              Kick
            </HoverButton>
            <HoverButton
              onClick={handleBanClick}
              className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
            >
              Ban
            </HoverButton>
          </div>
          <HoverButton
            onClick={handleAssignAdminClick}
            className="mb-4 w-full border p-2"
          >
            Assign Admin
          </HoverButton>
          <HoverButton
            onClick={handleTransferOwnerClick}
            className="w-full border bg-amber-800 p-2 hover:text-amber-800"
          >
            Transfer Owner
          </HoverButton>
        </ContentBox>
      )}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <UserList title="Ban" users={bannedUsers} />
          <UserList title="Admin" users={adminUsers} />
        </div>
        <HoverButton onClick={handleCloseClick} className="w-full border p-2">
          Close
        </HoverButton>
      </div>
    </div>
  );
};

export default ChannelManageModal;
