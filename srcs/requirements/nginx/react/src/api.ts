import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuthInfo } from './authSlice';
import { RootState } from './store';

const useCallAPI = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);

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
      dispatch(setAuthInfo(null));
    }
  };
  return callAPI;
};

export default useCallAPI;
