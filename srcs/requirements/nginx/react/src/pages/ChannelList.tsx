import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ListContainer from '../components/container/ListContainer';
import ListInfoPanel from '../components/container/ListInfoPanel';
import ListTitle from '../components/container/ListTitle';
import selectSocket from '../features/socket/socketSelector';

import type Channel from '../interfaces/Channel';
import type Chat from '../interfaces/Chat';

import { isTest, mockChannels } from '../mock'; // test

const ChannelList: React.FC = () => {
  const navigate = useNavigate();

  const { socket } = selectSocket();

  const [channels, setChannels] = useState<Channel[]>([]);

  const handleAllChannelsClick = () => {
    navigate('/all-channels');
  };

  const handleChannelDoubleClick = ({ id }: Channel) => {
    navigate(`/channel/${id}`);
  };

  useEffect(() => {
    const channelsHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket?.emit('find-my-channels', channelsHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  useEffect(() => {
    const messageHandler = (chat: Chat) => {
      const channelToUpdate = channels.find(
        (channel) => channel.id === chat.channelId,
      );
      if (!channelToUpdate) return;
      channelToUpdate.newMsgCount += 1;
      setChannels([...channels]);
    };
    socket?.on('send-channel', messageHandler);
    return () => {
      socket?.off('send-channel', messageHandler);
    };
  }, [channels]);

  return (
    <ListContainer>
      <div className="flex items-end">
        <ListTitle className="mb-4 ml-4">My Channels</ListTitle>
        <HoverButton
          onClick={handleAllChannelsClick}
          className="mb-3.5 ml-auto border px-2.5 py-2 text-sm"
        >
          All Channels
        </HoverButton>
      </div>
      {channels.map((channel) => {
        const { id, title, newMsgCount, memberCount } = channel;
        return (
          <li
            key={id}
            className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2"
            onDoubleClick={() => handleChannelDoubleClick(channel)}
          >
            <div className="flex items-center">
              <span>{title}</span>
            </div>
            <ListInfoPanel notification={newMsgCount}>
              <span className="text-sm text-gray-600">{`${memberCount} members`}</span>
            </ListInfoPanel>
          </li>
        );
      })}
    </ListContainer>
  );
};

export default ChannelList;
