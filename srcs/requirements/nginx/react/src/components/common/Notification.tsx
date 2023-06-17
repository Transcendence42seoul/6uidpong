import React, { useEffect } from 'react';

interface NotificationProps {
  children: React.ReactNode;
  className?: string;
  timer?: number;
  setShowNotification?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification: React.FC<NotificationProps> = ({
  children,
  className = 'bottom-0 bg-white',
  timer = 3000,
  setShowNotification = undefined,
}) => {
  useEffect(() => {
    if (!setShowNotification) return;
    const timerId = setTimeout(() => {
      setShowNotification(false);
    }, timer);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className={`fixed right-0 m-6 rounded-xl p-3 shadow-lg ${className}`}>
      {typeof children === 'string' ? (
        <span className="ml-1 text-sm text-black">{children}</span>
      ) : (
        children
      )}
    </div>
  );
};

export default Notification;
