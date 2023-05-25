import { useSelector } from 'react-redux';

import { RootState } from '../store';

const selectSocket = () => {
  return useSelector((state: RootState) => state.socket);
};

export default selectSocket;
