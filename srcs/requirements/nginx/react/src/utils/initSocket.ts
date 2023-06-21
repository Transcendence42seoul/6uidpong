import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let gameSocket: Socket | null = null;

const connectSocket = (namespace: string, token?: string) => {
  if (!socket) {
    socket = io(namespace, { auth: { token } });
    socket.on('connect', () => {
      socket?.emit('connection');
    });
  }
  return socket;
};

const initSocket = (token?: string) => {
  socket = connectSocket('/chat', token);
  gameSocket = connectSocket('/game', token);
  return { socket, gameSocket };
};

export default initSocket;
