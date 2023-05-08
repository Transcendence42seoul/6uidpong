import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface Chat {
  username: string;
  message: string;
}

const socket = io('/chat');

const ChatRoom: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const messageHandler = (chat: Chat) =>
      setChats((prevChats) => [...prevChats, chat]);

    socket.on('message', messageHandler);

    return () => {
      socket.off('message', messageHandler);
    };
  }, []);
};
