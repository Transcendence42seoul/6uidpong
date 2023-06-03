import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ListContainer from '../components/container/ListContainer';
import ListInfoPanel from '../components/container/ListInfoPanel';
import ListTitle from '../components/container/ListTitle';
import PasswordModal from '../components/modal/PasswordModal';
import ImageSrc from '../constants/ImageSrc';
import selectSocket from '../features/socket/socketSelector';

import type Channel from '../interfaces/Channel';

import { isTest, mockChannels } from '../mock'; // test

const AllChannels: React.FC = () => {
  const navigate = useNavigate();

  const { socket } = selectSocket();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null,
  );
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const joinChannel = (id = selectedChannelId) => {
    navigate(`/channel/${id}`);
  };

  const handleChannelDoubleClick = ({ id, isLocked }: Channel) => {
    setSelectedChannelId(id);
    if (isLocked) {
      setShowPasswordModal(true);
      return;
    }
    joinChannel(id);
  };

  const handleCreateChannelClick = () => {
    navigate('/channel-settings');
  };

  const onConfirmClick = () => {
    joinChannel();
  };

  useEffect(() => {
    const channelsHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket?.emit('find-all-channels', channelsHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  return (
    <ListContainer className="justify-center">
      <div className="flex items-end">
        <ListTitle className="mb-4 ml-4">All Channels</ListTitle>
        <HoverButton
          onClick={handleCreateChannelClick}
          className="mb-3.5 ml-auto border px-2.5 py-2 text-sm"
        >
          Create
        </HoverButton>
      </div>
      {channels.map((channel) => {
        const { id, title, isLocked, memberCount } = channel;
        return (
          <li
            key={id}
            className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
            onDoubleClick={() => handleChannelDoubleClick(channel)}
          >
            <div className="flex items-center space-x-1">
              <span>{title}</span>
              {isLocked && (
                <img src={ImageSrc.LOCK} alt="LOCK" className="h-5 w-5" />
              )}
            </div>
            <ListInfoPanel>
              <span className="text-sm text-gray-600">{`${memberCount} members`}</span>
            </ListInfoPanel>
          </li>
        );
      })}
      {selectedChannelId && showPasswordModal && (
        <PasswordModal
          onConfirmClick={onConfirmClick}
          setShowModal={setShowPasswordModal}
        />
      )}
    </ListContainer>
  );
};

export default AllChannels;
