import React from 'react';

interface ListContainerProps {
  children: React.ReactNode;
}

const ListContainer: React.FC<ListContainerProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <ul className="w-full max-w-3xl">{children}</ul>
    </div>
  );
};

export default ListContainer;
