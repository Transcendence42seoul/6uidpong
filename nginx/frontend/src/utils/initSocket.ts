import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let gameSocket: Socket | null = null;

export const initSocket = (token?: string) => {
  if (!socket) {
    socket = io('/chat', { auth: { token } });
    socket.on('connect', () => {
      socket?.emit('connection');
    });
  }
  return socket;
};

export const initGameSocket = (token?: string) => {
  if (!gameSocket) {
    gameSocket = io('/game', { auth: { token } });
    gameSocket.on('connect', () => {
      gameSocket?.emit('connection');
    });
  }
  return gameSocket;
};
