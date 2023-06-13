import axios, { AxiosResponse } from 'axios';
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

  const callApi = async (
    config: AxiosConfig,
    retry = false,
  ): Promise<AxiosResponse<any>> => {
    try {
      return await httpRequest(config);
    } catch (error) {
      if (!isUnauthorized(error) || retry) {
        dispatchAuth(null, dispatch);
        throw error;
      }
      const retryConfig = { url: '/api/v1/auth/token/refresh' };
      const { data: refreshToken } = await callApi(retryConfig, true);
      await dispatchAuth(refreshToken, dispatch);
      return callApi(config);
    }
  };

  return callApi;
};

export default useCallApi;
