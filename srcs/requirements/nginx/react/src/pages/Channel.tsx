import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ChatRoom from '../components/container/ChatRoom';
import UserSearchBar from '../components/container/UserSearchBar';

import type User from '../interfaces/User';
import CircularImage from '../components/container/CircularImage';
import ListTitle from '../components/container/ListTitle';

interface ChannelProps {
  socket: Socket;
}

const Channel: React.FC<ChannelProps> = ({ socket }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const password = state?.password;

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteUsers, setInviteUsers] = useState<User[]>([]);

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

  const handleCancelClick = () => {
    setShowInviteModal(false);
  };

  const handleConfirmClick = () => {
    setShowInviteModal(false);
  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
  };

  const handleSettingsClick = () => {
    navigate('/channel-settings', {
      state: { channelId },
    });
  };

  const onUserClick = (user: User) => {
    setInviteUsers([...inviteUsers, user]);
  };

  return (
    <>
      <div className="mx-auto flex max-w-[1024px] justify-end space-x-1.5 px-4">
        <HoverButton
          onClick={handleInviteClick}
          className="rounded border bg-blue-800 p-1.5 hover:text-blue-800"
        >
          Invite
        </HoverButton>
        <HoverButton
          onClick={handleSettingsClick}
          className="rounded border p-1.5"
        >
          Settings
        </HoverButton>
      </div>
      <ChatRoom join={join} leave={leave} send={send} socket={socket} />
      {showInviteModal && (
        <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40">
          <UserSearchBar onUserClick={onUserClick} />
          <div>
            <h1 className="m-1 text-lg font-bold text-white">Invite</h1>
            <ul>
              {inviteUsers.map((user) => {
                const { id, nickname, image } = user;
                return (
                  <li
                    key={id}
                    className="flex items-center space-x-2.5 border-b bg-white px-3 py-2"
                  >
                    <CircularImage
                      src={image}
                      alt={nickname}
                      className="h-6 w-6"
                    />
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
      )}
    </>
  );
};

export default Channel;
