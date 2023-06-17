import React from 'react';

interface NotificationProps {
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="fixed bottom-0 right-0 m-6 rounded-xl bg-white p-3 shadow-lg">
      <span className="ml-1 text-sm text-black">{message}</span>
    </div>
  );
};

export default Notification;
