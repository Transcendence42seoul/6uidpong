import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ChatRoom from '../components/container/ChatRoom';
import ChannelInviteModal from '../components/modal/ChannelInviteModal';
import useCallApi from '../utils/useCallApi';

import type User from '../interfaces/User';

import { isTest, mockUsers } from '../mock'; // test

interface ChannelProps {
  socket: Socket;
}

const Channel: React.FC<ChannelProps> = ({ socket }) => {
  const callApi = useCallApi();
  const navigate = useNavigate();

  const { state } = useLocation();
  const password = state?.password;

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  const join = {
    name: 'join-channel',
    data: { info: { channelId, password } },
  };

  const leave = {
    name: 'leave-channel',
    data: { channelId },
  };

  const send = {
    name: 'send-channel-message',
    data: { toId: channelId },
  };

  const handleExitClick = () => {
    socket.emit('exit-channel', { channelId });
  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
  };

  const handleSettingsClick = () => {
    navigate('/channel-settings', {
      state: { channelId },
    });
  };

  const onConfirmClick = (users: Set<User>) => {};

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
    <>
      <div className="mx-auto flex max-w-[1024px] justify-between space-x-1.5 px-4">
        <HoverButton
          onClick={handleSettingsClick}
          className="rounded border p-1.5"
        >
          Settings
        </HoverButton>
        <div className="space-x-1.5">
          <HoverButton
            onClick={handleInviteClick}
            className="rounded border bg-blue-800 p-1.5 hover:text-blue-800"
          >
            Invite
          </HoverButton>
          <HoverButton
            onClick={handleExitClick}
            className="rounded border bg-red-800 p-1.5 hover:text-red-800"
          >
            Exit
          </HoverButton>
        </div>
      </div>
      <ChatRoom join={join} leave={leave} send={send} socket={socket} />
      {showInviteModal && (
        <ChannelInviteModal
          title="Invite"
          userList={allUsers}
          onConfirmClick={onConfirmClick}
          setShowModal={setShowInviteModal}
        />
      )}
    </>
  );
};

export default Channel;
