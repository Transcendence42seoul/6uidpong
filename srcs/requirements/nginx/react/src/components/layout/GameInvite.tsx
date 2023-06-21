import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SocketContext from '../../context/SocketContext';
import Notification from '../common/Notification';

import type Game from '../../interfaces/Game';
import type GameInviteInfo from '../../interfaces/GameInviteInfo';

interface GameInviteProps {
  info: GameInviteInfo;
  setInfo: React.Dispatch<React.SetStateAction<GameInviteInfo | null>>;
}

const GameInvite: React.FC<GameInviteProps> = ({ info, setInfo }) => {
  const navigate = useNavigate();

  const { gameSocket } = useContext(SocketContext);

  const { master, roomId } = info;

  const handleAcceptClick = () => {
    gameSocket?.emit('invite-success', roomId);
    setInfo(null);
  };

  const handleRejectClick = () => {
    gameSocket?.emit('invite-failed', roomId);
    setInfo(null);
  };

  useEffect(() => {
    const gameHandler = (game: Game) => {
      navigate(`/custom/${roomId}`, {
        state: { game },
      });
    };
    gameSocket?.on('user-join', gameHandler);
  }, [gameSocket]);

  return (
    <Notification className="bottom-16 bg-white">
      <div className="ml-2 flex space-x-2">
        <span className="text-sm">{`${master} invites you to a game.`}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 1792 1792"
          fill="#44C997"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer"
          onClick={handleAcceptClick}
        >
          <path d="M1671 566q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136-362-362q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z" />
        </svg>
        <svg
          width="20"
          height="20"
          viewBox="0 0 1792 1792"
          fill="#FF4136"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer"
          onClick={handleRejectClick}
        >
          <path d="M1490 1342q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294z" />
        </svg>
      </div>
    </Notification>
  );
};

export default GameInvite;
