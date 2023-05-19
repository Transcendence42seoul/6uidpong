import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

interface TokenInfo {
  id: number;
  nickname: string;
}

interface AuthState {
  id: number | null;
  is2FA: boolean | null;
  accessToken: string | null;
  tokenInfo: TokenInfo | null;
}

const initialState: AuthState = {
  id: null,
  is2FA: null,
  accessToken: null,
  tokenInfo: null,
};

export type State = typeof initialState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, { payload }) => {
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

export const { setAuth } = authSlice.actions;

export default authSlice.reducer;
