import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

interface TokenInfo {
  id: number;
  nickname: string;
}

const initialState = {
  id: null,
  is2FA: null,
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
        state.is2FA = null;
        state.accessToken = null;
        state.tokenInfo = null;
        return;
      }
      state.id = payload.id;
      state.is2FA = payload.is2FA;
      state.accessToken = payload.accessToken;
      if (payload.accessToken) {
        state.tokenInfo = jwt_decode<TokenInfo>(payload.accessToken);
      }
    },
  },
});

export const { setAuthInfo } = authSlice.actions;

export default authSlice.reducer;
