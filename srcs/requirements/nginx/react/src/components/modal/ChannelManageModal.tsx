import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import CircularImage from '../container/CircularImage';
import ContentBox from '../container/ContentBox';
import ModalContainer from '../container/ModalContainer';
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
  const [admins, setAdmins] = useState<User[]>([]);
  const [banList, setBanList] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [owner, setOwner] = useState<User | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [sendData, setSendData] = useState<SendData | null>(null);

  const removeUser = () => {
    setMembers([...members.filter((user) => user.id !== selectedMember?.id)]);
  };

  const handleAssignAdminClick = () => {};

  const handleBanClick = () => {
    socket.emit('ban', sendData);
    removeUser();
  };

  const handleCloseClick = () => {
    setShowModal(false);
  };

  const handleKickClick = () => {
    socket.emit('kick', sendData);
    removeUser();
  };

  const handleMuteClick = () => {};

  const handleTransferOwnerClick = () => {
    socket.emit('transfer-ownership', sendData);
    setOwner(selectedMember);
  };

  const onUserClick = (user: User) => {
    setSelectedMember(user);
  };

  useEffect(() => {
    const adminsHandler = (users: User[]) => {
      setAdmins([...users]);
    };
    socket.emit('find-admins', { channelId }, adminsHandler);
    setAdmins(isTest ? mockUsers : admins); // test
  }, []);

  useEffect(() => {
    const banListHandler = (users: User[]) => {
      setBanList([...users]);
    };
    socket.emit('find-bans', { channelId }, banListHandler);
    setBanList(isTest ? mockUsers : banList); // test
  }, []);

  useEffect(() => {
    const membersHandler = (users: User[]) => {
      setMembers([...users]);
    };
    socket.emit('find-channel-users', { channelId }, membersHandler);
    setMembers(isTest ? mockUsers : members); // test
  }, []);

  useEffect(() => {
    if (!selectedMember) return;
    setSendData({
      info: {
        channelId,
        userId: selectedMember.id,
      },
    });
  }, [selectedMember]);

  return (
    <ModalContainer setShowModal={setShowModal}>
      <UserListWithSeacrhBar users={members} onUserClick={onUserClick} />
      {selectedMember && (
        <ContentBox className="max-h-96 max-w-xs border p-4">
          <h2 className="text-lg font-semibold">{selectedMember.nickname}</h2>
          <CircularImage
            src={selectedMember.image}
            alt={selectedMember.nickname}
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
          <UserList title="Ban" users={banList} />
          <UserList title="Admin" users={admins} />
        </div>
        <HoverButton onClick={handleCloseClick} className="w-full border p-2">
          Close
        </HoverButton>
      </div>
    </ModalContainer>
  );
};

export default ChannelManageModal;
