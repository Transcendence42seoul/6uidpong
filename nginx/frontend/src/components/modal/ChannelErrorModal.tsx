import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import HoverButton from '../common/HoverButton';
import ModalContainer from '../container/ModalContainer';
import ContentBox from '../common/ContentBox';

interface ChannelErrorModalProps {
  message: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelErrorModal: React.FC<ChannelErrorModalProps> = ({
  message,
  setShowModal,
}) => {
  const navigate = useNavigate();

  const handleConfirmClick = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleEnterKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirmClick();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEnterKeydown);
    return () => {
      document.removeEventListener('keydown', handleEnterKeydown);
    };
  }, []);

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="space-y-3 border bg-black px-8 py-4">
          <span>{message}</span>
          <HoverButton onClick={handleConfirmClick} className="border p-2">
            Back
          </HoverButton>
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default ChannelErrorModal;
