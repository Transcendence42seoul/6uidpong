import React from 'react';

interface ListTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ListTitle: React.FC<ListTitleProps> = ({ children, className = '' }) => {
  return <h1 className={`text-xl font-bold ${className}`}>{children}</h1>;
};

export default ListTitle;