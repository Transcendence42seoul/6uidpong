import React from 'react';

interface MessageProps {
  children: React.ReactNode;
  className?: string;
}

const Message: React.FC<MessageProps> = ({ children, className = '' }) => (
  <p className={`w-max rounded-md bg-white p-3 ${className}`}>{children}</p>
);

export default Message;
