import React from 'react';

interface CircularImageProps {
  src: string | undefined;
  alt: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const CircularImage: React.FC<CircularImageProps> = ({
  src,
  alt,
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`overflow-hidden rounded-full ${className}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <img className="h-full object-cover" src={src} alt={alt} />
    </button>
  );
};

export default CircularImage;
