import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ChatRoom from '../components/container/ChatRoom';
import UserSearchBar from '../components/container/UserSearchBar';

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
  const [inviteIds, setInviteIds] = useState<number[]>([]);

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

  const onUserClick = (id: number) => {
    setInviteIds([...inviteIds, id]);
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
        <div className="fixed inset-0 flex items-center justify-center space-x-0.5 bg-black bg-opacity-50">
          <UserSearchBar onUserClick={onUserClick} />
          <HoverButton
            onClick={handleConfirmClick}
            className="rounded border bg-blue-800 p-2 hover:text-blue-800"
          >
            Confirm
          </HoverButton>
          <HoverButton
            onClick={handleCancelClick}
            className="rounded border p-2"
          >
            Cancel
          </HoverButton>
        </div>
      )}
    </>
  );
};

export default Channel;
