import axios, { AxiosRequestConfig } from 'axios';
import { useDispatch } from 'react-redux';

import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';
import HttpStatus from './HttpStatus';

const useCallApi = () => {
  const dispatch = useDispatch();

  const { accessToken } = selectAuth();

  const httpRequest = (config: AxiosRequestConfig) => {
    const headers: any = { ...config.headers };
    headers.Authorization = `Bearer ${accessToken}`;
    return axios({
      ...config,
      method: config.method ?? 'get',
      headers,
    });
  };

  const callApi = async (config: AxiosRequestConfig) => {
    try {
      return await httpRequest(config);
    } catch (error) {
      if (!HttpStatus.isConflict(error)) {
        dispatchAuth(null, dispatch);
      }
      throw error;
    }
  };

  return callApi;
};

export default useCallApi;
