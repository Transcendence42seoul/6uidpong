import axios from 'axios';
import { useDispatch } from 'react-redux';

import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';

interface AxiosConfig {
  url: string;
  method?: string;
  headers?: any;
  params?: any;
  data?: any;
}

const useCallApi = () => {
  const dispatch = useDispatch();

  const { accessToken } = selectAuth();

  const httpRequest = (config: AxiosConfig, hasToken = true) => {
    const headers = { ...config.headers };
    if (hasToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return axios({
      ...config,
      method: config.method ?? 'get',
      headers,
    });
  };

  const isUnauthorized = (error: any) => {
    return axios.isAxiosError(error) && error.response?.status === 401;
  };

  const callApi = async (config: AxiosConfig, retry = false) => {
    try {
      return await httpRequest(config);
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }
      if (retry) {
        dispatchAuth(null, dispatch);
        return;
      }
      const { data: refreshToken } = await httpRequest(
        { url: '/api/v1/auth/token/refresh' },
        false,
      );
      await dispatchAuth(refreshToken, dispatch);
      callApi(config, true);
    }
  };

  return callApi;
};

export default useCallApi;
