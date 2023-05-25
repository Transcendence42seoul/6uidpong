import React from 'react';

import '../components/css/loading.css';
import ImageSrc from '../constants/ImageSrc';

const Loading: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <img
        src={ImageSrc.LOADING}
        alt="LOADING"
        className="infinite-rotation h-60 w-60"
      />
    </div>
  );
};

export default Loading;
