import React, { useState } from 'react';

import ContentBox from '../container/ContentBox';
import ModalContainer from '../container/ModalContainer';
import UserProfile from '../container/UserProfile';

import { isTest, mockUsers } from '../../mock'; // test

interface GameResultModalProps {
  setShowModal: (showModal: boolean) => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({ setShowModal }) => {
  const [p1Id, setP1Id] = useState<number | null>(
    isTest ? mockUsers[0].id : null,
  ); // test
  const [p2Id, setP2Id] = useState<number | null>(
    isTest ? mockUsers[2].id : null,
  ); // test

  const p1Score = 4;
  const p2Score = 2;
  const p1Win = p1Score > p2Score;
  const p2Win = p2Score > p1Score;

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="rounded-none border-2 p-8 shadow-md">
          <div className="flex justify-between space-x-8">
            <div className="flex flex-col items-center space-y-2">
              {p1Id && <UserProfile userId={p1Id}> </UserProfile>}
              <p className="text-lg">Score: {p1Score}</p>
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
              {p2Id && <UserProfile userId={p2Id}> </UserProfile>}
              <p className="text-lg">Score: {p2Score}</p>
              <p
                className={`text-2xl font-semibold ${
                  p2Win ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {p2Win ? 'WIN' : 'LOSE'}
              </p>
            </div>
          </div>
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default GameResultModal;
