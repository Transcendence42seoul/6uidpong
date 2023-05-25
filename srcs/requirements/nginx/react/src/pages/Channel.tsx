import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import ChatContainer from '../components/container/ChatContainer';
import CircularImage from '../components/container/CircularImage';
import Message from '../components/container/Message';
import MessageBox from '../components/container/MessageBox';
import MessageForm from '../components/container/MessageForm';
import selectAuth from '../features/auth/authSelector';
import formatTime from '../utils/formatTime';

import type Chat from '../interfaces/Chat';

interface ChannelProps {
  socket: Socket;
}

interface LocationState {
  password: string | undefined;
}

const Channel: React.FC<ChannelProps> = ({ socket }) => {
  const location = useLocation();
  const { password }: LocationState = location.state; // test

  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const chatContainer = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [newMsgCount, setNewMsgCount] = useState<number>(0);

  const addChat = (chat: Chat) => {
    setChats((prevChats) => [...prevChats, chat]);
    setNewMsgCount(0);
  };

  const handleInputMsgChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInputMsg(event.target.value);
    },
    [],
  );

  const handleInputMsgSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputMsg) return;
      const sendChannelMessageData = { to: { channelId, message: inputMsg } };
      const chatHandler = (chat: Chat) => {
        addChat(chat);
        setInputMsg('');
      };
      socket.emit('send-channel-message', sendChannelMessageData, chatHandler);
    },
    [inputMsg],
  );

  useEffect(() => {
    const joinChannelData = { info: { channelId, password } };
    const chatsHandler = ({
      newMsgCount: newMsgCnt,
      chats: prevChats,
    }: {
      newMsgCount: number;
      chats: Chat[];
    }) => {
      setNewMsgCount(newMsgCnt);
      setChats([...prevChats]);
    };
    socket.emit('join-channel', joinChannelData, chatsHandler);
    return () => {
      socket.emit('leave-channel', { channelId });
    };
  }, []);

  useEffect(() => {
    const chatHandler = (chat: Chat) => addChat(chat);
    socket.on('send-channel-message', chatHandler);
    return () => {
      socket.off('send-channel-message', chatHandler);
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
    <div className="mx-auto max-w-[1024px] p-4 pt-2">
      <ChatContainer ref={chatContainer}>
        {chats.map((chat, index) => {
          const { id, userId, nickname, image, message, createdAt } = chat;
          const prevUserId = chats[index - 1]?.userId;
          const isMyMsg = userId === myId;
          const isConsecutiveMsg = userId === prevUserId;
          const showUserInfo = !isMyMsg && !isConsecutiveMsg;
          let messageBoxClassName = '';
          let messageClassName = 'mt-1';
          if (isMyMsg) {
            messageBoxClassName = 'flex-col items-end';
            messageClassName = 'bg-yellow-300';
          } else if (isConsecutiveMsg) {
            messageBoxClassName = 'ml-10 pl-2.5';
            messageClassName = '';
          }
          return (
            <>
              {chats.length - index === newMsgCount && (
                <div>
                  <div className="mb-2 h-px w-full bg-red-500" />
                </div>
              )}
              <MessageBox key={id} className={messageBoxClassName}>
                {showUserInfo && (
                  <CircularImage
                    src={image}
                    alt={nickname}
                    className="h-10 w-10"
                  />
                )}
                <div>
                  {showUserInfo && (
                    <span className="text-white">{nickname}</span>
                  )}
                  <div className="mb-2 flex items-end">
                    {isMyMsg ? (
                      <>
                        <span className="mr-2 pb-1 text-xs text-gray-500">
                          {formatTime(createdAt)}
                        </span>
                        <Message className={messageClassName}>
                          {message}
                        </Message>
                      </>
                    ) : (
                      <>
                        <Message className={messageClassName}>
                          {message}
                        </Message>
                        <span className="ml-2 pb-1 text-xs text-gray-500">
                          {formatTime(createdAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </MessageBox>
            </>
          );
        })}
      </ChatContainer>
      <MessageForm onSubmit={handleInputMsgSubmit}>
        <input type="text" onChange={handleInputMsgChange} value={inputMsg} />
        <button className="bg-black p-2 text-white">Send</button>
      </MessageForm>
    </div>
  );
};

export default Channel;
