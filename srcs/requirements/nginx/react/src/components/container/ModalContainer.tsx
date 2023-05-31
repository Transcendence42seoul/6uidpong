import React, { useEffect } from 'react';

interface ModalContainerProps {
  setShowModal: (showModal: boolean) => void;
  children: React.ReactNode;
  closeButton?: boolean;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  setShowModal,
  children,
  closeButton = false,
}) => {
  const handleClickClose = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-gray-900 bg-opacity-60 pt-40">
      <div className="relative flex space-x-8 text-black">
        {closeButton && (
          <button
            className="absolute right-0 top-0 px-2 py-1 text-white"
            onClick={handleClickClose}
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
