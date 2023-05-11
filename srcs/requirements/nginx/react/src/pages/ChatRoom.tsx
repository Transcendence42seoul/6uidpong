import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ChatContainer from '../components/container/ChatContainer';
import Message from '../components/container/Message';
import MessageBox from '../components/container/MessageBox';
import MessageForm from '../components/container/MessageForm';

interface User {
  id: number;
  nickname: string;
  image: string;
}
interface Chat {
  id: number;
  user: User;
  message: string;
  createdAt: Date;
}

interface ChatRoomProps {
  myId: number;
  socket: Socket;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ myId, socket }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState<string>('');
  const chatContainer = useRef<HTMLDivElement>(null);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) return;

      socket.emit('message', message, (chat: Chat) => {
        setChats((prevChats) => [...prevChats, chat]);
        setMessage('');
      });
    },
    [message],
  );

  useEffect(() => {
    const chatsHandler = (prevChats: Chat[]) => setChats(prevChats);
    socket.emit('dm-chats', { roomId }, chatsHandler);
    return () => {
      socket.off('dm-chats', chatsHandler);
    };
  }, []);

  // useEffect(() => {
  //   const messageHandler = (chat: Chat) =>
  //     setChats((prevChats) => [...prevChats, chat]);
  //   socket.on('message', messageHandler);
  //   return () => {
  //     socket.off('message', messageHandler);
  //   };
  // }, []);

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
        {chats.map((chat) => {
          const { id: userId, nickname: username } = chat.user;
          let nickname = '';
          let className = '';
          if (!username) {
            className = 'alarm';
          } else if (userId === myId) {
            className = 'my_message';
          } else {
            nickname = username;
          }
          return (
            <MessageBox key={chat.id} className={className}>
              <span>{nickname}</span>
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
