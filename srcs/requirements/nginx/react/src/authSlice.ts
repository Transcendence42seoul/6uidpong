import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

interface TokenInfo {
  id: number;
  nickname: string;
  isTwoFactor: boolean;
}

const initialState = {
  accessToken: null,
  tokenInfo: null as TokenInfo | null,
};

export type State = typeof initialState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      if (!action.payload) {
        state.tokenInfo = null;
        return;
      }
      state.tokenInfo = jwt_decode<TokenInfo>(action.payload);
    },
  },
});

export const { setAccessToken } = authSlice.actions;

export default authSlice.reducer;
