import React, { useState } from 'react';

import HoverButton from '../button/HoverButton';
import ContentBox from './ContentBox';

const ChannelManagePanel: React.FC = () => {
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showBanModal, setShowBanModal] = useState<boolean>(false);
  const [showKickModal, setShowKickModal] = useState<boolean>(false);
  const [showMuteModal, setShowMuteModal] = useState<boolean>(false);
  const [showOwnerModal, setShowOwnerModal] = useState<boolean>(false);

  const handleChangeOwnerClick = () => {};
  const handleManageAdminClick = () => {};

  return (
    <div className="w-full max-w-sm items-center space-y-4 p-4">
      <ContentBox className="w-full max-w-xs space-y-2 p-4">
        <span className="text-md">Manage Users</span>
        <div className="flex space-x-1">
          <HoverButton
            onClick={handleManageAdminClick}
            className="rounded border p-2"
          >
            Mute
          </HoverButton>
          <HoverButton
            onClick={handleManageAdminClick}
            className="rounded border p-2"
          >
            Kick
          </HoverButton>
          <HoverButton
            onClick={handleManageAdminClick}
            className="rounded border p-2"
          >
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
