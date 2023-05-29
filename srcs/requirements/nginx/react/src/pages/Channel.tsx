import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ChannelMemberList from '../components/container/ChannelMemberList';
import ChatRoom from '../components/container/ChatRoom';
import ChannelInviteModal from '../components/modal/ChannelInviteModal';

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

  return (
    <div className="flex space-x-1 px-4">
      <ChannelMemberList socket={socket} />
      <div className="w-full max-w-[1024px]">
        <div className="flex justify-between space-x-1.5 px-4">
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
      </div>
      {showInviteModal && (
        <ChannelInviteModal setShowModal={setShowInviteModal} socket={socket} />
      )}
    </div>
  );
};

export default Channel;
