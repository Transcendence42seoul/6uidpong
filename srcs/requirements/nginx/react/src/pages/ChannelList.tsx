import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import HoverButton from '../components/button/HoverButton';
import { mockChannels } from '../mock'; // test

interface ChannelListProps {
  socket: Socket;
}

export interface Channel {
  id: number;
  title: string;
  isPublic: boolean;
  newMsgCount: number;
  memberCount: number;
}

const ChannelList: React.FC<ChannelListProps> = ({ socket }) => {
  const navigate = useNavigate();

  const [channels, setChannels] = useState<Channel[]>([]);

  const handleAllChannelsClick = () => {
    navigate('/channel/all');
  };

  const handleChannelDoubleClick = ({ id }: Channel) => {
    navigate(`/channel/${id}`);
  };

  useEffect(() => {
    const channelListHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket.emit('find-my-channels', channelListHandler);
    // setChannels(mockChannels); // test
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <HoverButton
        onClick={handleAllChannelsClick}
        className="mb-10 rounded border-2 p-2.5"
      >
        All Channels
      </HoverButton>
      <h1 className="mb-4 text-3xl font-bold">Channel</h1>
      <ul className="w-full max-w-3xl">
        {channels.map((channel) => {
          const { id, title, isPublic, newMsgCount, memberCount } = channel;
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
                {newMsgCount > 0 && (
                  <div className="mr-3 rounded-full bg-red-500 text-white">
                    {newMsgCount}
                  </div>
                )}
                <span className="text-sm text-gray-600">{`${memberCount} members`}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChannelList;