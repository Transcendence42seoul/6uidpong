import { configureStore } from '@reduxjs/toolkit';
import authReducer, { State as AuthState } from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = {
  auth: AuthState;
};

export default store;
