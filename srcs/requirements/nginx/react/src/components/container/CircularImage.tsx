import React from 'react';

interface CircularImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const CircularImage: React.FC<CircularImageProps> = ({
  src,
  alt,
  className,
  onClick,
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
