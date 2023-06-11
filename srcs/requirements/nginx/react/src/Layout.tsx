import React, { useEffect, useState } from 'react';

import Header from './components/layout/Header';
import Notification from './components/layout/Notification';
import { selectGameSocket } from './features/socket/socketSelector';

import type NotificationInfo from './interfaces/NotificationInfo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { gameSocket } = selectGameSocket();

  const [notificationInfo, setNotificationInfo] =
    useState<NotificationInfo | null>(null);

  useEffect(() => {
    const infoHandler = (info: NotificationInfo) => {
      setNotificationInfo({ ...info });
    };
    gameSocket?.on('invited-user', infoHandler);
    return () => {
      gameSocket?.off('invited-user', infoHandler);
    };
  }, []);

  return (
    <>
      <Header />
      {children}
      {notificationInfo && (
        <Notification info={notificationInfo} setInfo={setNotificationInfo} />
      )}
    </>
  );
};

export default Layout;
