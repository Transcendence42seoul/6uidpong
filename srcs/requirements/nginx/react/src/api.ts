import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthInfo } from './authSlice';
import { RootState } from './store';

const useCallAPI = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const callAPI = async (pathname: string, params: any = null) => {
    try {
      const { data } = await axios.get(pathname, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
      return data;
    } catch (error) {
      dispatch(setAuthInfo(null));
    }
  };
  return callAPI;
};

export default useCallAPI;
