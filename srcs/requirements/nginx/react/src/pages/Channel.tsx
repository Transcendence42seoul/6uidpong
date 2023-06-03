import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ChannelMemberList from '../components/container/ChannelMemberList';
import ChatRoom from '../components/container/ChatRoom';
import ChannelInviteModal from '../components/modal/ChannelInviteModal';
import selectSocket from '../features/socket/socketSelector';

const Channel: React.FC = () => {
  const { state } = useLocation();
  const password = state?.password;

  const navigate = useNavigate();

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = selectSocket();

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
    name: 'send-channel',
    data: { channelId },
  };

  const handleExitClick = () => {
    socket?.emit('exit', { channelId });
    navigate('/channel');
  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
  };

  const handleSettingsClick = () => {
    navigate('/channel-settings', {
      state: { channelId },
    });
  };

  useEffect(() => {
    const channelIdHandler = ({ id }: { id: number }) => {
      navigate('/channel');
    };
    socket?.on('banned-channel', channelIdHandler);
    socket?.on('kicked-channel', channelIdHandler);
    return () => {
      socket?.off('banned-channel', channelIdHandler);
      socket?.off('kicked-channel', channelIdHandler);
    };
  }, []);

  return (
    <div className="flex space-x-1 px-4">
      <ChannelMemberList />
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
        <ChatRoom join={join} leave={leave} send={send} />
      </div>
      {showInviteModal && (
        <ChannelInviteModal setShowModal={setShowInviteModal} />
      )}
    </div>
  );
};

export default Channel;
