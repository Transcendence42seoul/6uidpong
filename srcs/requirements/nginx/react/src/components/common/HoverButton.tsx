import React from 'react';

interface HoverButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  onClick,
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`border-white bg-black text-white hover:bg-white hover:text-black ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default HoverButton;
