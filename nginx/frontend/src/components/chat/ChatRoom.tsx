import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import selectAuth from '../../features/auth/authSelector';
import formatTime from '../../utils/formatTime';
import Alert from '../common/Alert';
import ChatContainer from './ChatContainer';
import CircularImage from '../common/CircularImage';
import Message from './Message';
import MessageBox from './MessageBox';
import MessageForm from './MessageForm';

import type Chat from '../../interfaces/Chat';
import type Game from '../../interfaces/Game';
import type Member from '../../interfaces/Member';
import type SendResponse from '../../interfaces/SendResponse';
import type SocketEvent from '../../interfaces/SocketEvent';

import { isTest, mockChats } from '../../mock'; // test
import SocketContext from '../../context/SocketContext';

interface ChatRoomProps {
  join: SocketEvent;
  leave: SocketEvent;
  send: SocketEvent;
}

interface Command {
  action: string;
  target: string[];
}

interface JoinResponse {
  newMsgCount: number;
  chats: Chat[];
  interlocutorId?: number;
  isBlocked?: boolean;
  channelId?: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ join, leave, send }) => {
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { socket, gameSocket } = useContext(SocketContext);

  const chatContainer = useRef<HTMLDivElement>(null);
  const [alert, setAlert] = useState<string>('');
  const [blocked, setBlocked] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [interlocutor, setInterlocutor] = useState<number | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [newMsgCount, setNewMsgCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const addChat = (chat: Chat) => {
    setChats((prevChats) => [...prevChats, chat]);
    setNewMsgCount(0);
  };

  const isCommand = () => {
    return inputMsg.startsWith('/');
  };

  const validateCommand = (command: Command) => {
    const { action, target } = command;
    if (action !== 'game') return null;
    if (interlocutor ? target.length !== 0 : target.length !== 1) return null;
    return command;
  };

  const parseCommand = () => {
    const tokens = inputMsg.split(' ');
    const action = tokens[0].substring(1);
    const target = tokens.slice(1);
    return validateCommand({ action, target });
  };

  const perform = ({ target }: Command) => {
    if (interlocutor === myId) {
      setAlert("You can't invite yourself.");
      return;
    }
    if (interlocutor) {
      gameSocket?.emit('invite-game', interlocutor);
      return;
    }
    const { channelId } = join.data.info;
    const membersHandler = (members: Member[]) => {
      const opponent = members.find((member) => member.nickname === target[0]);
      if (!opponent) {
        setAlert('You can only invite the user in the channel.');
        return;
      }
      gameSocket?.emit('invite-game', opponent.id);
    };
    socket?.emit('find-channel-users', { channelId }, membersHandler);
  };

  const handleInputMsgChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputMsg(event.target.value);
    },
    [],
  );

  const handleInputMsgSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputMsg) return;
      if (isCommand()) {
        const command = parseCommand();
        if (!command) {
          setAlert('Invalid command.');
          return;
        }
        perform(command);
        return;
      }
      const { channelId, interlocutorId } = send.data;
      const sendData = {
        to: {
          channelId,
          id: interlocutorId,
          message: inputMsg,
        },
      };
      socket?.emit(send.name, sendData);
      setInputMsg('');
    },
    [inputMsg],
  );

  useEffect(() => {
    const chatsHandler = ({
      newMsgCount: newMsgCnt,
      chats: prevChats,
      interlocutorId = undefined,
      isBlocked = undefined,
    }: JoinResponse) => {
      setNewMsgCount(newMsgCnt);
      setChats([...prevChats]);
      if (!interlocutorId) return;
      setInterlocutor(interlocutorId);
      setBlocked(!!isBlocked);
    };
    socket?.emit(join.name, join.data, chatsHandler);
    setChats(isTest ? mockChats : chats); // test
    return () => {
      socket?.emit(leave.name, leave.data);
    };
  }, []);

  useEffect(() => {
    const chatHandler = ({ chatResponse: chat }: SendResponse) => addChat(chat);
    socket?.on(send.name, chatHandler);
    return () => {
      socket?.off(send.name, chatHandler);
    };
  }, []);

  useEffect(() => {
    const muteHandler = () => {
      if (!muted) {
        setAlert('You are muted.');
        setMuted((prevState) => !prevState);
      }
    };
    socket?.on('muted', muteHandler);
    return () => {
      socket?.off('muted', muteHandler);
    };
  }, []);

  useEffect(() => {
    const gameHandler = (game: Game) => {
      navigate(`/custom/${game.roomId}`, {
        state: { game },
      });
    };
    gameSocket?.on('invite-room-created', gameHandler);
    return () => {
      gameSocket?.off('invite-room-created', gameHandler);
    };
  }, []);

  useEffect(() => {
    if (alert && !showAlert) {
      setShowAlert((prevState) => !prevState);
    }
  }, [alert]);

  useEffect(() => {
    if (blocked) {
      setAlert("You can't send DM to the user who blocked you.");
    }
  }, [blocked]);

  useEffect(() => {
    const { current } = chatContainer;
    if (!current) return;

    const { clientHeight, scrollHeight } = current;
    if (scrollHeight > clientHeight) {
      current.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    const blockHandler = ({ userId: blockUser }: { userId: number }) => {
      if (!blocked && blockUser === interlocutor) {
        setAlert("You can't send DM to the user who blocked you.");
        setBlocked((prevState) => !prevState);
      }
    };
    socket?.on('block', blockHandler);
    return () => {
      socket?.off('block', blockHandler);
    };
  }, [blocked, interlocutor]);

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
        <input
          type="text"
          value={inputMsg}
          onChange={handleInputMsgChange}
          disabled={blocked}
        />
        <button className="bg-black p-2 text-white">Send</button>
      </MessageForm>
      {showAlert && <Alert message={alert} setShowAlert={setShowAlert} />}
    </div>
  );
};

export default ChatRoom;
