import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer, { AuthState } from './auth/authSlice';
import gameSocketReducer, { GameSocketState } from './socket/gameSocketSlice';
import socketReducer, { SocketState } from './socket/socketSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  gameSocket: gameSocketReducer,
  socket: socketReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export interface RootState {
  auth: AuthState;
  gameSocket: GameSocketState;
  socket: SocketState;
}

export default store;
