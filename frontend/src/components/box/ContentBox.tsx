import React from 'react';

interface ContentBoxProps {
  className?: string;
  children: React.ReactNode;
}

const ContentBox: React.FC<ContentBoxProps> = ({ className, children }) => {
  return (
    <div
      className={`items-center rounded border-white bg-black text-center text-white ${className}`}
    >
      {children}
    </div>
  );
};

export default ContentBox;
