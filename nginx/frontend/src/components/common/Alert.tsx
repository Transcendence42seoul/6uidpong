import React from 'react';

import Notification from './Notification';

interface AlertProps {
  message: string;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

const Alert: React.FC<AlertProps> = ({ message, setShowAlert }) => {
  return (
    <Notification
      className="bottom-0 border border-red-400 bg-red-100"
      setShowNotification={setShowAlert}
    >
      <span className="ml-1 text-sm text-red-700">{message}</span>
    </Notification>
  );
};

export default Alert;
