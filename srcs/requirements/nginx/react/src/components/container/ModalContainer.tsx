import React from 'react';

interface ModalContainerProps {
  children: React.ReactNode;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40">
      {children}
    </div>
  );
};

export default ModalContainer;
