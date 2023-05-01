import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

interface TokenInfo {
  id: number;
  nickname: string;
}

const initialState = {
  id: null,
  isTwoFactor: null,
  accessToken: null,
  tokenInfo: null as TokenInfo | null,
};

export type State = typeof initialState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthInfo: (state, { payload }) => {
      if (!payload) {
        state.id = null;
        state.isTwoFactor = null;
        state.accessToken = null;
        state.tokenInfo = null;
        return;
      }
      state.id = payload.id;
      state.isTwoFactor = payload.isTwoFactor;
      state.accessToken = payload.accessToken;
      if (payload.accessToken) {
        state.tokenInfo = jwt_decode<TokenInfo>(payload.accessToken);
      }
    },
  },
});

export const { setAuthInfo } = authSlice.actions;

export default authSlice.reducer;
