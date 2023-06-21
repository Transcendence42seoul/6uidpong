import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ChannelMemberList from '../components/channel/ChannelMemberList';
import ChatRoom from '../components/chat/ChatRoom';
import HoverButton from '../components/common/HoverButton';
import ChannelErrorModal from '../components/modal/ChannelErrorModal';
import ChannelInviteModal from '../components/modal/ChannelInviteModal';
import ChannelRole from '../constants/ChannelRole';
import SocketContext from '../context/SocketContext';

import type Member from '../interfaces/Member';

const Channel: React.FC = () => {
  const { MEMBER, ADMIN, OWNER } = ChannelRole;

  const { state } = useLocation();
  const password = state?.password;

  const navigate = useNavigate();

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = useContext(SocketContext);

  const [error, setError] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [role, setRole] = useState<number>(MEMBER);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  const join = {
    name: 'join-channel',
    data: { info: { channelId, password } },
  };

  const leave = {
    name: 'leave-channel',
    data: { channelId },
  };

  const send = {
    name: 'send-channel',
    data: { channelId },
  };

  const exitChannel = (alert?: string) => {
    navigate('/channel', {
      state: { alert },
    });
  };

  const handleExitClick = () => {
    socket?.emit('exit', { channelId });
  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
  };

  const handleSettingsClick = () => {
    navigate('/channel-settings', {
      state: { channelId, role },
    });
  };

  useEffect(() => {
    const banHandler = () => {
      exitChannel('You are banned.');
    };
    const deleteHandler = ({ id }: { id: number }) => {
      if (id === channelId) {
        navigate('/channel');
      }
    };
    const kickHandler = () => {
      exitChannel('You are kicked.');
    };
    socket?.on('banned-channel', banHandler);
    socket?.on('delete-channel', deleteHandler);
    socket?.on('exit-channel', exitChannel);
    socket?.on('kicked-channel', kickHandler);
    return () => {
      socket?.off('banned-channel', banHandler);
      socket?.off('delete-channel', deleteHandler);
      socket?.off('exit-channel', exitChannel);
      socket?.off('kicked-channel', kickHandler);
    };
  }, []);

  useEffect(() => {
    const joinBannedHandler = () => {
      setError('You are banned.');
    };
    const incorrectHandler = () => {
      setError('Wrong password.');
    };
    socket?.on('join-banned', joinBannedHandler);
    socket?.on('incorrect-password', incorrectHandler);
    return () => {
      socket?.off('join-banned', joinBannedHandler);
      socket?.off('incorrect-password', incorrectHandler);
    };
  }, []);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  return (
    <div className="flex space-x-1 px-4">
      <ChannelMemberList members={members} role={role} setRole={setRole} />
      <div className="w-full max-w-[1024px]">
        <div className="flex justify-between space-x-1.5 px-4">
          {role >= ADMIN && (
            <HoverButton onClick={handleSettingsClick} className="border p-1.5">
              Settings
            </HoverButton>
          )}
          <div className={`space-x-1.5 ${role < ADMIN && 'ml-auto'}`}>
            <HoverButton
              onClick={handleInviteClick}
              className="border bg-blue-800 p-1.5 hover:text-blue-800"
            >
              Invite
            </HoverButton>
            {role < OWNER && (
              <HoverButton
                onClick={handleExitClick}
                className="border bg-red-800 p-1.5 hover:text-red-800"
              >
                Exit
              </HoverButton>
            )}
          </div>
        </div>
        <ChatRoom
          join={join}
          leave={leave}
          send={send}
          setMembers={setMembers}
        />
      </div>
      {showErrorModal && (
        <ChannelErrorModal message={error} setShowModal={setShowErrorModal} />
      )}
      {showInviteModal && (
        <ChannelInviteModal setShowModal={setShowInviteModal} />
      )}
    </div>
  );
};

export default Channel;
