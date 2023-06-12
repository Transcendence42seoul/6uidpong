import React from 'react';
import { useParams } from 'react-router-dom';

import selectSocket from '../../features/socket/socketSelector';
import HoverButton from '../button/HoverButton';
import UserProfile from './UserProfile';

import type Member from '../../interfaces/Member';

interface ChannelMemberProfileProps {
  member: Member;
  className?: string;
}

interface SendData {
  info: {
    channelId: number;
    userId: number;
    time: number;
  };
}

const ChannelMemberProfile: React.FC<ChannelMemberProfileProps> = ({
  member,
  className = '',
}) => {
  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = selectSocket();

  const { id: userId, isAdmin, isOwner } = member;

  const sendData: SendData = {
    info: {
      channelId,
      userId,
      time: 30,
    },
  };

  const handleAssignAdminClick = () => {
    socket?.emit('add-admin', sendData);
  };

  const handleBanClick = () => {
    socket?.emit('ban', sendData);
  };

  const handleKickClick = () => {
    socket?.emit('kick', sendData);
  };

  const handleMuteClick = () => {
    socket?.emit('mute', sendData);
  };

  const handleTransferOwnerClick = () => {
    socket?.emit('transfer-ownership', sendData);
  };

  return (
    <UserProfile userId={userId} className={className}>
      {isAdmin && (
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
      )}
      {isOwner && (
        <div className="w-full flex-col space-y-4">
          <HoverButton onClick={handleAssignAdminClick} className="border p-2">
            Assign Admin
          </HoverButton>
          <HoverButton
            onClick={handleTransferOwnerClick}
            className="border bg-amber-800 p-2 hover:text-amber-800"
          >
            Transfer Owner
          </HoverButton>
        </div>
      )}
    </UserProfile>
  );
};

export default ChannelMemberProfile;
