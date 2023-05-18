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
import AlertWithCloseButton from '../components/alert/AlertWithCloseButton';
import ChatContainer from '../components/container/ChatContainer';
import CircularImage from '../components/container/CircularImage';
import Message from '../components/container/Message';
import MessageBox from '../components/container/MessageBox';
import MessageForm from '../components/container/MessageForm';
import { mockChats, mockLocationState } from '../mock'; // test

export interface Chat {
  id: number;
  roomId: string;
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

interface LocationState {
  interlocutorId: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ myId, socket }) => {
  const location = useLocation();
  const { interlocutorId }: LocationState = location.state ?? mockLocationState; // test
  const { roomId } = useParams<{ roomId: string }>();

  const chatContainer = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [newMsgCount, setNewMsgCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const addChat = (chat: Chat) => {
    setChats((prevChats) => [...prevChats, chat]);
    setNewMsgCount(0);
  };

  const handleChangeInputMsg = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInputMsg(event.target.value);
    },
    [],
  );

  const handleCloseAlert = () => setShowAlert(false);

  const handleSubmitInputMsg = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputMsg) return;
      const sendDmData = { to: { id: interlocutorId, message: inputMsg } };
      const chatHandler = (chat: Chat) => {
        addChat(chat);
        setInputMsg('');
      };
      socket.emit('send-dm', sendDmData, chatHandler);
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
    // setChats(mockChats); // test
    socket.emit('join-dm', { interlocutorId }, chatsHandler);
    return () => {
      socket.emit('leave-dm', { roomId });
    };
  }, []);

  useEffect(() => {
    const chatHandler = (chat: Chat) => addChat(chat);
    const errorHandler = () => setShowAlert(true);
    socket.on('send-dm', chatHandler);
    socket.on('error', errorHandler);
    return () => {
      socket.off('send-dm', chatHandler);
      socket.off('error', errorHandler);
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
          const { id, userId, nickname, image, message } = chat;
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
                  <Message className={messageClassName}>{message}</Message>
                </div>
              </MessageBox>
            </>
          );
        })}
      </ChatContainer>
      <MessageForm onSubmit={handleSubmitInputMsg}>
        <input type="text" onChange={handleChangeInputMsg} value={inputMsg} />
        <button className="bg-black p-2 text-white">Send</button>
      </MessageForm>
      {showAlert && (
        <AlertWithCloseButton
          message="You can't send DM to user who blocked you."
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
};

export default ChatRoom;
