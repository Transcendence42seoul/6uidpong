import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ModalContainerProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  setShowModal,
  children,
  className = '',
  closeButton = false,
}) => {
  const location = useLocation();
  const initialRender = useRef(true);

  const handleCloseClick = () => {
    setShowModal(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    setShowModal(false);
  }, [location]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-gray-900 bg-opacity-60 pt-40">
      <div className={`relative shadow-md ${className}`}>
        {closeButton && (
          <button
            className="absolute right-0 top-0 px-2 py-1 text-white"
            onClick={handleCloseClick}
          >
            x
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default ModalContainer;
