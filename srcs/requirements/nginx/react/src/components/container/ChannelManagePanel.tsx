import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import ContentBox from './ContentBox';

interface ChannelManagePanelProps {
  channelId: number;
  socket: Socket;
}

const ChannelManagePanel: React.FC<ChannelManagePanelProps> = ({
  channelId,
  socket,
}) => {
  const navigate = useNavigate();

  const [showManageMembersModal, setShowManageMembersModal] =
    useState<boolean>(false);

  const handleDeleteChannelClick = () => {
    socket.emit('delete-channel', { channelId });
    navigate('/channel');
  };

  const handleManageMembersClick = () => {
    setShowManageMembersModal(true);
  };

  return (
    <ContentBox className="w-full max-w-sm space-y-4 p-7">
      <HoverButton
        onClick={handleManageMembersClick}
        className="w-full max-w-xs border p-2"
      >
        Manage Members
      </HoverButton>
      <HoverButton
        onClick={handleDeleteChannelClick}
        className="w-full max-w-xs border bg-red-800 p-2 hover:text-red-800"
      >
        Delete Channel
      </HoverButton>
    </ContentBox>
  );
};

export default ChannelManagePanel;
