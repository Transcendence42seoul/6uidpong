import React from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../button/HoverButton';
import UserProfile from './UserProfile';

import type User from '../../interfaces/User';

interface ChannelMemberProfileProps {
  member: User;
  socket: Socket;
  className?: string;
}

interface SendData {
  info: {
    channelId: number;
    userId: number;
    limitedAt: Date | null;
    value: boolean | null;
  };
}

const ChannelMemberProfile: React.FC<ChannelMemberProfileProps> = ({
  member,
  socket,
  className = '',
}) => {
  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const sendData: SendData = {
    info: {
      channelId,
      userId: member.id,
      limitedAt: null,
      value: null,
    },
  };

  const handleAssignAdminClick = () => {
    sendData.info.value = true;
    socket.emit('update-admin', sendData);
    sendData.info.value = null;
  };

  const handleBanClick = () => {
    socket.emit('ban', sendData);
  };

  const handleKickClick = () => {
    socket.emit('kick', sendData);
  };

  const handleMuteClick = () => {
    const currentTime = new Date();
    sendData.info.limitedAt = new Date(currentTime.getTime() + 30000); // 30초
    socket.emit('mute', sendData);
    sendData.info.limitedAt = null;
  };

  const handleTransferOwnerClick = () => {
    socket.emit('transfer-ownership', sendData);
  };

  return (
    <UserProfile user={member} className={className}>
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
