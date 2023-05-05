import React from 'react';

interface HoverButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  onClick,
  className,
  children,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer border-white bg-black text-white hover:bg-white hover:text-black ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default HoverButton;
