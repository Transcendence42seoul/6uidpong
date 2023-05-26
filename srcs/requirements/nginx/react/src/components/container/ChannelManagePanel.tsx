import React, { useState } from 'react';

import HoverButton from '../button/HoverButton';
import ContentBox from './ContentBox';

const ChannelManagePanel: React.FC = () => {
  const [showBanModal, setShowBanModal] = useState<boolean>(false);
  const [showKickModal, setShowKickModal] = useState<boolean>(false);
  const [showMuteModal, setShowMuteModal] = useState<boolean>(false);
  const [showChangeOwnerModal, setShowChangeOwnerModal] =
    useState<boolean>(false);
  const [showManageAdminModal, setShowManageAdminModal] =
    useState<boolean>(false);

  const handleBanClick = () => setShowBanModal(true);
  const handleKickClick = () => setShowKickModal(true);
  const handleMuteClick = () => setShowMuteModal(true);
  const handleChangeOwnerClick = () => setShowChangeOwnerModal(true);
  const handleManageAdminClick = () => setShowManageAdminModal(true);

  return (
    <div className="w-full max-w-sm items-center space-y-4 p-4">
      <ContentBox className="w-full max-w-xs space-y-2 p-4">
        <span className="text-md">Manage Users</span>
        <div className="flex space-x-1">
          <HoverButton onClick={handleMuteClick} className="rounded border p-2">
            Mute
          </HoverButton>
          <HoverButton onClick={handleKickClick} className="rounded border p-2">
            Kick
          </HoverButton>
          <HoverButton onClick={handleBanClick} className="rounded border p-2">
            Ban
          </HoverButton>
        </div>
      </ContentBox>
      <ContentBox className="w-full max-w-xs p-4">
        <HoverButton
          onClick={handleManageAdminClick}
          className="w-full border p-2"
        >
          Manage Admin
        </HoverButton>
        <HoverButton
          onClick={handleChangeOwnerClick}
          className="w-full border p-2"
        >
          Change Owner
        </HoverButton>
      </ContentBox>
    </div>
  );
};

export default ChannelManagePanel;
