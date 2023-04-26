import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAccessToken } from './authSlice';
import { RootState } from './store';

const callAPI = async (pathname: string) => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  try {
    await axios.get(pathname, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    navigate(pathname);
  } catch (error) {
    dispatch(setAccessToken(null));
  }
};

export default callAPI;
