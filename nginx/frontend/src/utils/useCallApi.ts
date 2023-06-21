import axios, { AxiosRequestConfig } from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import dispatchAuth from '../features/auth/authAction';
import selectAuth from '../features/auth/authSelector';
import HttpStatus from './HttpStatus';

const useCallApi = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      if (HttpStatus.isError(error, 401)) {
        dispatchAuth(null, dispatch);
      } else if (HttpStatus.isError(error, 500)) {
        navigate('/error');
      }
      throw error;
    }
  };

  return callApi;
};

export default useCallApi;
