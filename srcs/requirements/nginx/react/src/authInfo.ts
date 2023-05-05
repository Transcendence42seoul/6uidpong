import { Dispatch } from 'redux';
import { setAuthInfo } from './authSlice';

interface AuthInfo {
  id: number | null;
  is2FA: boolean;
  accessToken: string | null;
}

const handleAuthInfo = async (data: AuthInfo, dispatch: Dispatch) => {
  dispatch(setAuthInfo(data));
};

export default handleAuthInfo;
