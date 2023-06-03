import { useSelector } from 'react-redux';

import { RootState } from '../store';

export const selectGameSocket = () => {
  return useSelector((state: RootState) => state.gameSocket);
};

const selectSocket = () => {
  return useSelector((state: RootState) => state.socket);
};

export default selectSocket;
