import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface Chat {
  username: string;
  message: string;
}

const socket = io('/chat');

const ChatRoom: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const messageHandler = (chat: Chat) =>
      setChats((prevChats) => [...prevChats, chat]);

    socket.on('message', messageHandler);

    return () => {
      socket.off('message', messageHandler);
    };
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) {
        return alert('메시지를 입력해 주세요.');
      }

      socket.emit('message', message, (chat: Chat) => {
        setChats((prevChats) => [...prevChats, chat]);
        setMessage('');
      });
    },
    [message],
  );
};
