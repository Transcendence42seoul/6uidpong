import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SocketContext from '../../context/SocketContext';
import HoverButton from '../common/HoverButton';
import ChannelManageModal from '../modal/ChannelManageModal';
import ContentBox from '../common/ContentBox';

interface ChannelManagePanelProps {
  channelId: number;
  role: number;
}

const ChannelManagePanel: React.FC<ChannelManagePanelProps> = ({
  channelId,
  role,
}) => {
  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);

  const [showManageModal, setShowManageModal] = useState<boolean>(false);

  const exitChannel = (alert?: string) => {
    navigate('/channel', {
      state: { alert },
    });
  };

  const handleDeleteChannelClick = () => {
    socket?.emit('delete-channel', { channelId });
  };

  const handleManageMembersClick = () => {
    setShowManageModal(true);
  };

  useEffect(() => {
    socket?.on('exit-channel', exitChannel);
    return () => {
      socket?.off('exit-channel', exitChannel);
    };
  }, []);

  return (
    <ContentBox className="w-full max-w-sm space-y-4 bg-black p-7">
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
          role={role}
          setShowModal={setShowManageModal}
        />
      )}
    </ContentBox>
  );
};

export default ChannelManagePanel;
