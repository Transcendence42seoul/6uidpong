import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

interface TokenInfo {
  id: number;
  nickname: string;
}

export interface AuthState {
  id: number | undefined;
  is2FA: boolean | undefined;
  accessToken: string | undefined;
  tokenInfo: TokenInfo | undefined;
}

const initialState: AuthState = {
  id: undefined,
  is2FA: undefined,
  accessToken: undefined,
  tokenInfo: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, { payload }) => {
      if (!payload) {
        state.tokenInfo = undefined;
        return;
      }
      const { id, is2FA, accessToken } = payload;
      state.id = id;
      state.is2FA = is2FA;
      if (!accessToken) return;
      state.accessToken = accessToken;
      state.tokenInfo = jwt_decode<TokenInfo>(accessToken);
    },
  },
});

export const { setAuth } = authSlice.actions;

export default authSlice.reducer;
