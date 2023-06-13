import { Dispatch } from 'redux';

import { AuthState, setAuth } from './authSlice';

const dispatchAuth = async (data: AuthState | null, dispatch: Dispatch) => {
  dispatch(setAuth(data));
};

export default dispatchAuth;
