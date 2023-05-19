import axios from 'axios';
import { useDispatch } from 'react-redux';
import selectAuth from '../features/auth/authSelector';
import { setAuth } from '../features/auth/authSlice';

const useCallAPI = () => {
  const dispatch = useDispatch();

  const { accessToken } = selectAuth();

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
      dispatch(setAuth(null));
    }
  };
  return callAPI;
};

export default useCallAPI;
