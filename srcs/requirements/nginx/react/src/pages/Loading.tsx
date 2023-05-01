import React from 'react';
import Image from '../constants/Image';
import '../components/css/loading.css';

const Loading: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <img
        src={Image.LOADING}
        alt="LOADING"
        className="infinite-rotation h-60 w-60"
      />
    </div>
  );
};

export default Loading;
