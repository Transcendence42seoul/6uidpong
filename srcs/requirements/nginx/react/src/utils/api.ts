import axios from 'axios';
import { useDispatch } from 'react-redux';
import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';

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
      dispatchAuth(null, dispatch);
    }
  };
  return callAPI;
};

export default useCallAPI;
