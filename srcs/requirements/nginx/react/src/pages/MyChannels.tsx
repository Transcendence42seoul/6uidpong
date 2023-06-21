import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/common/Alert';
import HoverButton from '../components/common/HoverButton';
import ListInfoPanel from '../components/common/ListInfoPanel';
import ListTitle from '../components/common/ListTitle';
import ListContainer from '../components/container/ListContainer';
import selectSocket from '../features/socket/socketSelector';

import type Channel from '../interfaces/Channel';
import type SendResponse from '../interfaces/SendResponse';

import { isTest, mockChannels } from '../mock'; // test

const MyChannels: React.FC = () => {
  const { state } = useLocation();
  const alert = state?.alert;

  const navigate = useNavigate();

  const { socket } = selectSocket();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(!!alert);

  const chatHandler = ({ channelId }: SendResponse) => {
    const channelToUpdate = channels.find(
      (channel) => channel.id === channelId,
    );
    if (!channelToUpdate) return;
    channelToUpdate.newMsgCount += 1;
    setChannels([...channels]);
  };

  const handleAllClick = () => {
    navigate('/all-channels');
  };

  const handleChannelDoubleClick = ({ id }: Channel) => {
    navigate(`/channel/${id}`);
  };

  const handleCreateChannelClick = () => {
    navigate('/channel-settings');
  };

  useEffect(() => {
    const channelsHandler = (channelList: Channel[]) => {
      setChannels([...channelList]);
    };
    socket?.emit('find-my-channels', channelsHandler);
    setChannels(isTest ? mockChannels : channels); // test
  }, []);

  useEffect(() => {
    socket?.on('send-channel', chatHandler);
    return () => {
      socket?.off('send-channel', chatHandler);
    };
  }, [channels]);

  return (
    <ListContainer>
      <div className="flex items-end">
        <ListTitle className="mb-4 ml-4">My Channels</ListTitle>
        <HoverButton
          onClick={handleAllClick}
          className="mb-3.5 ml-3.5 border px-2 py-1.5 text-sm"
        >
          ALL
        </HoverButton>
        <HoverButton
          onClick={handleCreateChannelClick}
          className="mb-3.5 ml-auto border px-2.5 py-1.5 text-sm"
        >
          Create
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
      {showAlert && <Alert message={alert} setShowAlert={setShowAlert} />}
    </ListContainer>
  );
};

export default MyChannels;
