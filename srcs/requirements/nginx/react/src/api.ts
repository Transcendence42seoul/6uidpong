import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAccessToken } from './authSlice';
import { RootState } from './store';

const useCallAPI = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const callAPI = async (pathname: string, isNavigate = true) => {
    try {
      const { data } = await axios.get(pathname, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!isNavigate) {
        return data;
      }
      navigate(pathname);
    } catch (error) {
      dispatch(setAccessToken(null));
    }
  };

  return callAPI;
};

export default useCallAPI;
