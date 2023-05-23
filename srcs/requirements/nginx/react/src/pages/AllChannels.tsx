import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ListContainer from '../components/container/ListContainer';
import ListTitle from '../components/container/ListTitle';
import Image from '../constants/Image';
import { Channel } from './ChannelList';
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

  useEffect(() => {
    const channelListHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket.emit('find-all-channels', channelListHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  return (
    <ListContainer>
      <ListTitle className="mb-3.5 ml-4">All Channels</ListTitle>
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
                <img src={Image.LOCK} alt="LOCK" className="h-5 w-5" />
              )}
            </div>
            <span className="text-sm text-gray-600">{`${memberCount} members`}</span>
          </li>
        );
      })}
    </ListContainer>
  );
};

export default AllChannels;
