import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold">All Channels</h1>
      <ul className="w-full max-w-3xl">
        {channels.map((channel) => {
          const { id, title, isPublic, memberCount } = channel;
          return (
            <li
              key={id}
              className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
              onDoubleClick={() => handleChannelDoubleClick(channel)}
            >
              <div className="flex items-center">
                {/* isPublic 아이콘 */}
                <span>{title}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">{memberCount}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AllChannels;
