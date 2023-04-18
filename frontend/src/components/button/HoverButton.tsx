import React from 'react';

interface HoverButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  onClick,
  className,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer border-white bg-black text-white hover:bg-white hover:text-black ${className}`}
    >
      {children}
    </button>
  );
};

export default HoverButton;
