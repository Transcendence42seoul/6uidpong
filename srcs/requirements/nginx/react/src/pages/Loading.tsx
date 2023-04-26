import React from 'react';
import Image from '../constants/Image';
import '../styles/loading.css';

const Loading: React.FC = () => {
  return (
    <div className="infinite-rotation bg-black">
      <img src={Image.LOADING} alt="LOADING" />
    </div>
  );
};

export default Loading;
