import axios from 'axios';
import { useDispatch } from 'react-redux';
import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';

interface CallApiConfig {
  url: string;
  method?: string;
  params?: any;
  data?: any;
}

const useCallApi = () => {
  const dispatch = useDispatch();
  const { accessToken } = selectAuth();

  const callApi = async ({
    url,
    method = 'get',
    params = null,
    data = null,
  }: CallApiConfig) => {
    try {
      const response = await axios({
        url,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
        data,
      });
      return response.data;
    } catch (error) {
      dispatchAuth(null, dispatch);
    }
  };
  return callApi;
};

export default useCallApi;
