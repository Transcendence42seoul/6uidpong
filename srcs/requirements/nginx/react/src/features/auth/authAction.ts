import { Dispatch } from 'redux';

import { AuthState, setAuth } from './authSlice';

const dispatchAuth = async (data: AuthState, dispatch: Dispatch) => {
  dispatch(setAuth(data));
};

export default dispatchAuth;
