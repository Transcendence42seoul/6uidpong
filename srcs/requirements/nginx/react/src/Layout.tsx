import React from 'react';
import { Socket } from 'socket.io-client';

import Header from './components/layout/Header';

interface LayoutProps {
  socket: Socket;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ socket, children }) => {
  return (
    <>
      <Header socket={socket} />
      {children}
    </>
  );
};

export default Layout;
