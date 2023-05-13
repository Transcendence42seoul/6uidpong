import React from 'react';

interface MessageBoxProps {
  children: React.ReactNode;
  className?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({ children, className }) => (
  <div className={`flex ${className}`}>{children}</div>
);

export default MessageBox;
