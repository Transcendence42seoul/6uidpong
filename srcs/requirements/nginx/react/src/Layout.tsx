import React, { useEffect, useState } from 'react';

import GameInvite from './components/layout/GameInvite';
import Header from './components/layout/Header';
import { selectGameSocket } from './features/socket/socketSelector';

import type GameInviteInfo from './interfaces/GameInviteInfo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { gameSocket } = selectGameSocket();

  const [gameInviteInfo, setGameInviteInfo] = useState<GameInviteInfo | null>(
    null,
  );

  const infoHandler = (info: GameInviteInfo) => {
    setGameInviteInfo({ ...info });
  };

  useEffect(() => {
    gameSocket?.on('invited-user', infoHandler);
  }, [gameSocket]);

  return (
    <>
      <Header />
      {children}
      {gameInviteInfo && (
        <GameInvite info={gameInviteInfo} setInfo={setGameInviteInfo} />
      )}
    </>
  );
};

export default Layout;
