import React from 'react';

type MessageBoxProps = {
  children: React.ReactNode;
  className?: string;
};

const MessageBox: React.FC<MessageBoxProps> = ({ children, className }) => (
  <div className={`flex flex-col ${className}`}>{children}</div>
);

export default MessageBox;
