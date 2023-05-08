import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import ChatContainer from '../components/container/ChatContainer';
import Message from '../components/container/Message';
import MessageBox from '../components/container/MessageBox';
import MessageForm from '../components/container/MessageForm';

interface Chat {
  username: string;
  message: string;
}

const socket = io('/chat');

const ChatRoom: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState<string>('');
  const chatContainer = useRef<HTMLDivElement>(null);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
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

  useEffect(() => {
    const messageHandler = (chat: Chat) =>
      setChats((prevChats) => [...prevChats, chat]);

    socket.on('message', messageHandler);
    return () => {
      socket.off('message', messageHandler);
    };
  }, []);

  useEffect(() => {
    const { current } = chatContainer;
    if (!current) return;

    const { clientHeight, scrollHeight } = current;
    if (scrollHeight > clientHeight) {
      current.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  return (
    <>
      <h1>WebSocket Chat</h1>
      <ChatContainer ref={chatContainer}>
        {chats.map((chat, index) => {
          let username = '';
          let className = '';
          if (!chat.username) {
            className = 'alarm';
          } else if (socket.id === chat.username) {
            className = 'my_message';
          } else {
            username = chat.username;
          }
          return (
            /* eslint-disable-next-line react/no-array-index-key */
            <MessageBox key={index} className={className}>
              <span>{username}</span>
              <Message className="message">{chat.message}</Message>
            </MessageBox>
          );
        })}
      </ChatContainer>
      <MessageForm onSubmit={onSendMessage}>
        <input type="text" onChange={onChange} value={message} />
        <button>Send</button>
      </MessageForm>
    </>
  );
};

export default ChatRoom;
