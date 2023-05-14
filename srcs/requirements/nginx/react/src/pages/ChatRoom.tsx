import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ChatContainer from '../components/container/ChatContainer';
import CircularImage from '../components/container/CircularImage';
import Message from '../components/container/Message';
import MessageBox from '../components/container/MessageBox';
import MessageForm from '../components/container/MessageForm';

export interface Chat {
  id: number;
  userId: number;
  nickname: string;
  image: string;
  message: string;
  createdAt: string;
}

interface ChatRoomProps {
  myId: number;
  socket: Socket;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ myId, socket }) => {
  const location = useLocation();
  const { interlocutorId } = location.state;
  const { roomId } = useParams<{ roomId: string }>();

  const chatContainer = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState<string>('');

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) return;
      const sendDmData = { to: { userId: interlocutorId, roomId }, message };
      const chatHandler = (chat: Chat) => {
        setChats((prevChats) => [...prevChats, chat]);
        setMessage('');
      };
      socket.emit('send-dm', sendDmData, chatHandler);
    },
    [message],
  );

  useEffect(() => {
    const chatsHandler = ({ chats: prevChats }: { chats: Chat[] }) =>
      setChats(prevChats);
    socket.emit('join-dm', { interlocutorId }, chatsHandler);
    return () => {
      socket.emit('leave-dm', { roomId });
    };
  }, []);

  useEffect(() => {
    const messageHandler = (chat: Chat) =>
      setChats((prevChats) => [...prevChats, chat]);
    socket.on('send-dm', messageHandler);
    return () => {
      socket.off('send-dm', messageHandler);
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
        {chats.map((chat) => {
          const isMyMessage = chat.userId === myId;
          let msgBoxClassName = '';
          let msgClassName = '';
          let nickname = '';
          if (isMyMessage) {
            msgBoxClassName = 'flex-col items-end';
            msgClassName = 'bg-yellow-300';
          } else {
            nickname = chat.nickname;
          }
          return (
            <MessageBox key={chat.id} className={msgBoxClassName}>
              {!isMyMessage && (
                <CircularImage
                  src={chat.image}
                  alt="Interlocutor"
                  className="mr-2 h-10 w-10"
                />
              )}
              <div>
                <span>{nickname}</span>
                <Message className={msgClassName}>{chat.message}</Message>
              </div>
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
