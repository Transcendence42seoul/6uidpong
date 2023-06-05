import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import selectSocket from '../../features/socket/socketSelector';
import HoverButton from '../button/HoverButton';
import ChannelManageModal from '../modal/ChannelManageModal';
import ContentBox from './ContentBox';

interface ChannelManagePanelProps {
  channelId: number;
}

const ChannelManagePanel: React.FC<ChannelManagePanelProps> = ({
  channelId,
}) => {
  const navigate = useNavigate();

  const { socket } = selectSocket();

  const [showManageModal, setShowManageModal] = useState<boolean>(false);

  const handleDeleteChannelClick = () => {
    socket?.emit('delete-channel', { channelId });
    navigate('/channel');
  };

  const handleManageMembersClick = () => {
    setShowManageModal(true);
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
      {showManageModal && (
        <ChannelManageModal
          channelId={channelId}
          setShowModal={setShowManageModal}
        />
      )}
    </ContentBox>
  );
};

export default ChannelManagePanel;
