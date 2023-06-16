import React from 'react';
import { useParams } from 'react-router-dom';

import selectSocket from '../../features/socket/socketSelector';
import HoverButton from '../common/HoverButton';
import UserProfile from '../common/UserProfile';

import type Member from '../../interfaces/Member';

interface ChannelMemberProfileProps {
  member: Member;
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
    <UserProfile
      userId={userId}
      className="border border-white"
      footer={!isAdmin}
    >
      {isOwner && (
        <div className="mt-2 flex w-full flex-col text-sm">
          <HoverButton
            onClick={handleAssignAdminClick}
            className="border-y p-2"
          >
            Assign Admin
          </HoverButton>
          <HoverButton onClick={handleTransferOwnerClick} className="p-2">
            Transfer Owner
          </HoverButton>
        </div>
      )}
      {isAdmin && (
        <div
          className={`mx-4 flex w-full border-t text-sm ${!isOwner && 'mt-2'}`}
        >
          <HoverButton onClick={handleMuteClick} className="w-1/3 p-2">
            Mute
          </HoverButton>
          <HoverButton onClick={handleKickClick} className="w-1/3 border-x p-2">
            Kick
          </HoverButton>
          <HoverButton onClick={handleBanClick} className="w-1/3 p-2">
            Ban
          </HoverButton>
        </div>
      )}
    </UserProfile>
  );
};

export default ChannelMemberProfile;
