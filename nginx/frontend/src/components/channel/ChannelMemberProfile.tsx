import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import ChannelRole from '../../constants/ChannelRole';
import SocketContext from '../../context/SocketContext';
import selectAuth from '../../features/auth/authSelector';
import HoverButton from '../common/HoverButton';
import UserProfile from '../common/UserProfile';

import type Member from '../../interfaces/Member';

interface ChannelMemberProfileProps {
  member: Member;
  role: number;
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
  role,
}) => {
  const { MEMBER, ADMIN, OWNER } = ChannelRole;

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { socket } = useContext(SocketContext);

  const { id: userId } = member;
  const isMe = userId === myId;

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
      className="border border-white bg-[#211f20]"
      footer={!isMe && role === MEMBER}
    >
      {!isMe && role === OWNER && (
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
      {!isMe && role >= ADMIN && (
        <div
          className={`mx-4 flex w-full border-t text-sm ${
            role === ADMIN && 'mt-2'
          }`}
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
