import React from 'react';

import ImageSrc from '../constants/ImageSrc';

const Error: React.FC = () => {
  return (
    <div
      className="flex h-[90vh] items-center justify-center bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${ImageSrc.ERROR})` }}
    />
  );
};

export default Error;
