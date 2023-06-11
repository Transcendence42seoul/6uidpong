import React from 'react';
import { useNavigate } from 'react-router-dom';

import { selectGameSocket } from '../../features/socket/socketSelector';

import type NotificationInfo from '../../interfaces/NotificationInfo';

interface NotificationProps {
  info: NotificationInfo;
  setInfo: (info: NotificationInfo | null) => void;
}

const Notification: React.FC<NotificationProps> = ({ info, setInfo }) => {
  const navigate = useNavigate();

  const { gameSocket } = selectGameSocket();

  const { nickname, roomId } = info;

  const handleAcceptClick = () => {
    gameSocket?.emit('invite-success', roomId);
    setInfo(null);
    navigate(`/custom/${roomId}`);
  };

  const handleRejectClick = () => {
    gameSocket?.emit('invite-failed', roomId);
    setInfo(null);
  };

  return (
    <div className="fixed bottom-0 right-0 m-6">
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="ml-2 flex space-x-2">
          <span className="font-semibold">{`${nickname} invites you to a game.`}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 1792 1792"
            fill="#44C997"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer"
            onClick={handleAcceptClick}
          >
            <path d="M1671 566q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136-362-362q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z" />
          </svg>
          <svg
            width="24"
            height="24"
            viewBox="0 0 1792 1792"
            fill="#FF4136"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer"
            onClick={handleRejectClick}
          >
            <path d="M1490 1342q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Notification;
