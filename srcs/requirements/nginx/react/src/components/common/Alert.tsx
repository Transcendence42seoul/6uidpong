import React from 'react';

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="fixed bottom-0 right-0 m-6 rounded-xl border border-red-400 bg-red-100 p-3 shadow-lg">
      <span className="ml-1 text-sm text-red-700">{message}</span>
    </div>
  );
};

export default Alert;
