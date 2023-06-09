import React from 'react';

import ContentBox from '../container/ContentBox';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';

import type { GameRoomState } from '../../interfaces/Game';

interface GameResultModalProps {
  gameResult: GameRoomState;
  setShowModal: (showModal: boolean) => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  gameResult,
  setShowModal,
}) => {
  const { user1Id, user2Id, score1, score2 } = gameResult;
  const p1Win = score1 > score2;

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="rounded-none border-2 p-8 shadow-md">
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
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default GameResultModal;
