import { useSelector } from 'react-redux';
import { RootState } from '../store';

const selectAuth = () => {
  return useSelector((state: RootState) => state.auth);
};

export default selectAuth;
