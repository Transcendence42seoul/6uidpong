import React from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../common/HoverButton';
import ContentBox from '../common/ContentBox';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../common/UserProfile';

import type GameState from '../../interfaces/GameState';

interface GameResultModalProps {
  gameResult: GameState;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  gameResult,
  setShowModal,
}) => {
  const navigate = useNavigate();

  const { user1Id, user2Id, score1, score2 } = gameResult;
  const p1Win = score1 > score2;

  const handleGameListClick = () => navigate('/custom');
  const handleHomeClick = () => navigate('/');

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="space-y-6 rounded-none border-2 bg-black p-8 pb-4 shadow-md">
          <div className="flex justify-between space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <UserProfile userId={user1Id} />
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
              <UserProfile userId={user2Id} />
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
            <HoverButton onClick={handleGameListClick} className="border p-2">
              Game
            </HoverButton>
          </div>
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default GameResultModal;
