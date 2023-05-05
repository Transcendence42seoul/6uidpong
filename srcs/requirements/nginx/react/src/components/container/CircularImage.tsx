import React from 'react';

interface CircularImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
}

const CircularImage: React.FC<CircularImageProps> = ({
  src,
  alt,
  className,
}) => {
  return (
    <div className={`overflow-hidden rounded-full ${className}`}>
      <img className="h-full object-cover" src={src} alt={alt} />
    </div>
  );
};

export default CircularImage;
