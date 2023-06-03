import { Dispatch } from 'redux';

import { GameSocketState, setGameSocket } from './gameSocketSlice';
import { SocketState, setSocket } from './socketSlice';

export const dispatchGameSocket = async (
  data: GameSocketState,
  dispatch: Dispatch,
) => {
  dispatch(setGameSocket(data));
};

const dispatchSocket = async (data: SocketState, dispatch: Dispatch) => {
  dispatch(setSocket(data));
};

export default dispatchSocket;
