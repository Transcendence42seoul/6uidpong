import { createContext } from 'react';

import type Sockets from '../interfaces/Sockets';

const SocketContext = createContext<Sockets>({
  socket: null,
  gameSocket: null,
});

export default SocketContext;
