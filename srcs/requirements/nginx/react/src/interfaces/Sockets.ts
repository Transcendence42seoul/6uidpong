import { Socket } from 'socket.io-client';

interface Sockets {
  socket: Socket | null;
  gameSocket: Socket | null;
}

export default Sockets;
