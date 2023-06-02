import { Dispatch } from 'redux';

import { SocketState, setSocket } from './socketSlice';

const dispatchSocket = async (data: SocketState, dispatch: Dispatch) => {
  dispatch(setSocket(data));
};

export default dispatchSocket;
