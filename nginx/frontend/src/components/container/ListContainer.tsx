import React from 'react';

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ListContainer: React.FC<ListContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`mt-20 flex min-h-screen flex-col items-center ${className}`}
    >
      <ul className="w-full max-w-3xl">{children}</ul>
    </div>
  );
};

export default ListContainer;
