import { Dispatch } from 'redux';
import { setAuth } from './authSlice';

interface AuthInfo {
  id: number | null;
  is2FA: boolean;
  accessToken: string | null;
}

const dispatchAuth = async (data: AuthInfo, dispatch: Dispatch) => {
  dispatch(setAuth(data));
};

export default dispatchAuth;
