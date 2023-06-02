import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Socket } from 'socket.io-client';

import selectAuth from '../../features/auth/authSelector';
import formatTime from '../../utils/formatTime';
import AlertWithCloseButton from '../alert/AlertWithCloseButton';
import ChatContainer from './ChatContainer';
import CircularImage from './CircularImage';
import Message from './Message';
import MessageBox from './MessageBox';
import MessageForm from './MessageForm';

import type Chat from '../../interfaces/Chat';
import type SocketEvent from '../../interfaces/SocketEvent';

import { isTest, mockChats } from '../../mock'; // test

interface ChatRoomProps {
  join: SocketEvent;
  leave: SocketEvent;
  send: SocketEvent;
  socket: Socket;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ join, leave, send, socket }) => {
  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const chatContainer = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [newMsgCount, setNewMsgCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);

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

  const handleAlertClose = () => setShowAlert(false);

  const handleInputMsgSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputMsg) return;
      const { channelId, interlocutorId } = send.data;
      const sendData = {
        to: {
          channelId,
          id: interlocutorId,
          message: inputMsg,
        },
      };
      socket.emit(send.name, sendData);
      setInputMsg('');
    },
    [inputMsg],
  );

  useEffect(() => {
    const chatsHandler = ({
      newMsgCount: newMsgCnt,
      chats: prevChats,
    }: {
      newMsgCount: number;
      chats: Chat[];
    }) => {
      if (showAlert) return;
      setNewMsgCount(newMsgCnt);
      setChats([...prevChats]);
    };
    socket.emit(join.name, join.data, chatsHandler);
    setChats(isTest ? mockChats : chats); // test
    return () => {
      socket.emit(leave.name, leave.data);
    };
  }, []);

  useEffect(() => {
    const chatHandler = (chat: Chat) => addChat(chat);
    socket.on(send.name, chatHandler);
    return () => {
      socket.off(send.name, chatHandler);
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

  useEffect(() => {
    if (showAlert) {
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      return () => clearTimeout(timeoutId);
    }
  }, [showAlert]);

  return (
    <div className="mx-auto max-w-[1024px] p-4 pt-2">
      <ChatContainer ref={chatContainer}>
        {chats.map((chat, index) => {
          const { id, userId, nickname, image, message, isSystem, createdAt } =
            chat;
          const prevUserId = chats[index - 1]?.userId;
          const prevIsSystem = chats[index - 1]?.isSystem;
          const isMyMsg = userId === myId;
          const isConsecutiveMsg = !prevIsSystem && userId === prevUserId;
          const showUserInfo = !isSystem && !isMyMsg && !isConsecutiveMsg;
          let messageBoxClassName = '';
          let messageClassName = 'mt-1 bg-white';
          if (isSystem) {
            messageBoxClassName = 'flex-col items-center';
            messageClassName = 'bg-gray-700 py-2.5 text-xs text-gray-300';
          } else if (isMyMsg) {
            messageBoxClassName = 'flex-col items-end';
            messageClassName = 'bg-yellow-300';
          } else if (isConsecutiveMsg) {
            messageBoxClassName = 'ml-10 pl-2.5';
            messageClassName = 'bg-white';
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
                          {!isSystem && formatTime(createdAt)}
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
                          {!isSystem && formatTime(createdAt)}
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
      {showAlert && (
        <AlertWithCloseButton
          message="You can't send DM to user who blocked you."
          onClose={handleAlertClose}
        />
      )}
    </div>
  );
};

export default ChatRoom;
