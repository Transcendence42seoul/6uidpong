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

  const httpRequest = (config: AxiosConfig) => {
    const headers = { ...config.headers };
    headers.Authorization = `Bearer ${accessToken}`;
    return axios({
      ...config,
      method: config.method ?? 'get',
      headers,
    });
  };

  const callApi = async (config: AxiosConfig) => {
    try {
      return await httpRequest(config);
    } catch (error) {
      dispatchAuth(null, dispatch);
      throw error;
    }
  };

  return callApi;
};

export default useCallApi;
