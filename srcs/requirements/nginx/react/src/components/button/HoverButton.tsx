import React from 'react';

interface HoverButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  onClick,
  children,
  className,
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
