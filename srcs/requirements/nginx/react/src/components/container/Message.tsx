import React from 'react';

type MessageProps = {
  children: React.ReactNode;
  className?: string;
};

const Message: React.FC<MessageProps> = ({ children, className }) => (
  <span className={`mb-2 w-max rounded-md bg-white p-3 ${className}`}>
    {children}
  </span>
);

export default Message;
