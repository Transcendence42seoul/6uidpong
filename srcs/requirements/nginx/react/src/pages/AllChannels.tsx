import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import HoverButton from '../components/button/HoverButton';
import ListContainer from '../components/container/ListContainer';
import ListInfoPanel from '../components/container/ListInfoPanel';
import ListTitle from '../components/container/ListTitle';
import ImageSrc from '../constants/ImageSrc';

import type Channel from '../interfaces/Channel';

import { isTest, mockChannels } from '../mock'; // test

interface AllChannelsProps {
  socket: Socket;
}

const AllChannels: React.FC<AllChannelsProps> = ({ socket }) => {
  const navigate = useNavigate();

  const [channels, setChannels] = useState<Channel[]>([]);

  const handleChannelDoubleClick = ({ id }: Channel) => {
    navigate(`/channel/${id}`);
  };

  const handleCreateChannelClick = () => {
    navigate('/channel-settings');
  };

  useEffect(() => {
    const channelListHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket.emit('find-all-channels', channelListHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  return (
    <ListContainer>
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
    </ListContainer>
  );
};

export default AllChannels;
