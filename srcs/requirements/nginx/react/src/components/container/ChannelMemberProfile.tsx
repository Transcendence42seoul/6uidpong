import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import UserProfile from './UserProfile';

import type User from '../../interfaces/User';

interface ChannelMemberProfileProps {
  member: User;
  socket: Socket;
}

const ChannelMemberProfile: React.FC<ChannelMemberProfileProps> = ({
  member,
  socket,
}) => {
  return (
    <UserProfile user={member}>
      <div className="m-4 flex w-full">
        <HoverButton
          onClick={handleMuteClick}
          className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
        >
          Mute
        </HoverButton>
        <HoverButton
          onClick={handleKickClick}
          className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
        >
          Kick
        </HoverButton>
        <HoverButton
          onClick={handleBanClick}
          className="w-1/3 border border-red-800 p-2 text-red-800 hover:text-red-800"
        >
          Ban
        </HoverButton>
      </div>
      <HoverButton
        onClick={handleAssignAdminClick}
        className="mb-4 w-full border p-2"
      >
        Assign Admin
      </HoverButton>
      <HoverButton
        onClick={handleTransferOwnerClick}
        className="w-full border bg-amber-800 p-2 hover:text-amber-800"
      >
        Transfer Owner
      </HoverButton>
    </UserProfile>
  );
};

export default ChannelMemberProfile;
