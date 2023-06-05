import { createSlice } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

export interface GameSocketState {
  gameSocket: Socket | null;
}

const initialGameState: GameSocketState = {
  gameSocket: null,
};

const gameSocketSlice = createSlice({
  name: 'gameSocket',
  initialState: initialGameState,
  reducers: {
    setGameSocket: (state, { payload }) => {
      state.gameSocket = payload.gameSocket;
    },
  },
});

export const { setGameSocket } = gameSocketSlice.actions;

export default gameSocketSlice.reducer;
