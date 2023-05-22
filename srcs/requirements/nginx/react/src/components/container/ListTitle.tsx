import React from 'react';

interface ListTitleProps {
  children: React.ReactNode;
}

const ListTitle: React.FC<ListTitleProps> = ({ children }) => {
  return <h1 className="mb-4 ml-4 text-xl font-bold">{children}</h1>;
};

export default ListTitle;
