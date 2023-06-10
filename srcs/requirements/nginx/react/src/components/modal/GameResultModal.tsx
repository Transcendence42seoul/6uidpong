import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import selectAuth from '../../features/auth/authSelector';
import { selectGameSocket } from '../../features/socket/socketSelector';
import HoverButton from '../button/HoverButton';
import ContentBox from '../container/ContentBox';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';

import type GameState from '../../interfaces/GameState';

interface GameResultModalProps {
  gameResult: GameState;
  setShowModal: (showModal: boolean) => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  gameResult,
  setShowModal,
}) => {
  const navigate = useNavigate();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;
  const myNickname = tokenInfo?.nickname;

  const { gameSocket } = selectGameSocket();

  const { user1Id, user2Id, score1, score2 } = gameResult;
  const opponentId = myId === user1Id ? user2Id : user1Id;

  const p1Win = score1 > score2;

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleRematchClick = () => {
    gameSocket?.emit('invite-game', opponentId);
  };

  useEffect(() => {
    const gameIdHandler = (gameId: number) => {
      const game = {
        roomId: gameId,
        title: `${myNickname}'s game`,
        isLocked: true,
        masterId: myId,
      };
      navigate(`/custom/${gameId}`, {
        state: { game },
      });
    };
    gameSocket?.on('invite-room-created', gameIdHandler);
    return () => {
      gameSocket?.off('invite-room-created', gameIdHandler);
    };
  }, []);

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="space-y-6 rounded-none border-2 p-8 pb-4 shadow-md">
          <div className="flex justify-between space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <UserProfile userId={user1Id}> </UserProfile>
              <p className="text-lg">Score: {score1}</p>
              <p
                className={`text-2xl font-semibold ${
                  p1Win ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {p1Win ? 'WIN' : 'LOSE'}
              </p>
            </div>
            <div className="border-r border-white" />
            <div className="flex flex-col items-center space-y-2">
              <UserProfile userId={user2Id}> </UserProfile>
              <p className="text-lg">Score: {score2}</p>
              <p
                className={`text-2xl font-semibold ${
                  p1Win ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {p1Win ? 'LOSE' : 'WIN'}
              </p>
            </div>
          </div>
          <div className="space-x-2">
            <HoverButton onClick={handleHomeClick} className="border p-2">
              Home
            </HoverButton>
            <HoverButton onClick={handleRematchClick} className="border p-2">
              Rematch
            </HoverButton>
          </div>
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default GameResultModal;
