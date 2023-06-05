import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ContentBox from '../components/container/ContentBox';
import UserProfile from '../components/container/UserProfile';

import { isTest, mockUsers } from '../mock'; // test

const GameWaitingRoom: React.FC = () => {
  const { state } = useLocation();
  const title = state?.title;

  const navigate = useNavigate();

  const [masterId, setMasterId] = useState<number | null>(
    isTest ? mockUsers[0].id : null,
  ); // test
  const [participantId, setParticipantId] = useState<number | null>(
    isTest ? mockUsers[2].id : null,
  ); // test

  const handleStartClick = () => {};

  const handleExitClick = () => {
    navigate('/custom');
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <ContentBox className="space-y-4 rounded-none border-2 p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center justify-between">
          {masterId && <UserProfile userId={masterId}> </UserProfile>}
          <span className="text-lg">vs</span>
          {participantId && <UserProfile userId={participantId}> </UserProfile>}
        </div>
        <div className="flex space-x-2">
          <HoverButton className="border p-2" onClick={handleStartClick}>
            Start
          </HoverButton>
          <HoverButton className="border p-2" onClick={handleExitClick}>
            Exit
          </HoverButton>
        </div>
      </ContentBox>
    </div>
  );
};

export default GameWaitingRoom;
