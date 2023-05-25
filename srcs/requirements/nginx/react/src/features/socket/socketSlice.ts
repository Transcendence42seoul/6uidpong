import { createSlice } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

export interface SocketState {
  socket: Socket | null;
}

const initialState: SocketState = {
  socket: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, { payload }) => {
      state.socket = payload.socket;
    },
  },
});

export const { setSocket } = socketSlice.actions;

export default socketSlice.reducer;
