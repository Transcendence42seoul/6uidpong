import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import LadderQueueModal from '../components/modal/LadderQueueModal';

interface RoomInfo {
  user1Id: number;
  user2Id: number;
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

interface LadderProps {
  socket: Socket;
}

const Ladder: React.FC<LadderProps> = ({ socket }) => {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setTimeout(() => {
      setOpenModal(false);
      navigate('/game-start');
    }, 5000);
  };

  useEffect(() => {
    socket.emit('ladder-game-match');
    console.log('ladder match start');
  }, []);

  socket.on('game-start', (roomInfo: RoomInfo) => {
    if (roomInfo !== undefined) setOpenModal(true);
  });

  return (
    <div>
      <LadderQueueModal isOpen={openModal} onClose={handleCloseModal}>
        <div style={{ pointerEvents: 'auto' }}>
          {openModal && (
            <div>
              <h1>is loading</h1>
            </div>
          )}
        </div>
      </LadderQueueModal>
    </div>
  );
};

export default Ladder;
