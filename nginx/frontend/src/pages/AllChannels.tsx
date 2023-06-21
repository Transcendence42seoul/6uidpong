import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/common/HoverButton';
import ListInfoPanel from '../components/common/ListInfoPanel';
import ListTitle from '../components/common/ListTitle';
import ListContainer from '../components/container/ListContainer';
import PasswordModal from '../components/modal/PasswordModal';
import ImageSrc from '../constants/ImageSrc';
import SocketContext from '../context/SocketContext';

import type Channel from '../interfaces/Channel';

import { isTest, mockChannels } from '../mock'; // test

const AllChannels: React.FC = () => {
  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null,
  );
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const handleChannelDoubleClick = ({ id, isLocked }: Channel) => {
    setSelectedChannelId(id);
    if (isLocked) {
      setShowPasswordModal(true);
      return;
    }
    navigate(`/channel/${id}`);
  };

  const handleCreateChannelClick = () => {
    navigate('/channel-settings');
  };

  const handleMyClick = () => {
    navigate('/channel');
  };

  const onConfirmClick = (password: string) => {
    navigate(`/channel/${selectedChannelId}`, {
      state: { password },
    });
  };

  useEffect(() => {
    const channelsHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket?.emit('find-all-channels', channelsHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  return (
    <ListContainer>
      <div className="flex items-end">
        <ListTitle className="mb-4 ml-4">All Channels</ListTitle>
        <HoverButton
          onClick={handleMyClick}
          className="mb-3.5 ml-3.5 border px-2 py-1.5 text-sm"
        >
          MY
        </HoverButton>
        <HoverButton
          onClick={handleCreateChannelClick}
          className="mb-3.5 ml-auto border px-2.5 py-1.5 text-sm"
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
          isWrongPassword={false}
          onConfirmClick={onConfirmClick}
          setShowModal={setShowPasswordModal}
        />
      )}
    </ListContainer>
  );
};

export default AllChannels;
