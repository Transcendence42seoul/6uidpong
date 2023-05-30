import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';

interface ChannelPasswordModalProps {
  channelId: number;
  setShowModal: (showModal: boolean) => void;
}

const ChannelPasswordModal: React.FC<ChannelPasswordModalProps> = ({
  channelId,
  setShowModal,
}) => {
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>('');

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    navigate(`/channel/${channelId}`, {
      state: password,
    });
  };

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div className="flex">
        <HoverButton
          onClick={handleConfirmClick}
          className="border bg-blue-800 p-2 hover:text-blue-800"
        >
          Confirm
        </HoverButton>
        <HoverButton onClick={handleCancelClick} className="border p-2">
          Cancel
        </HoverButton>
      </div>
    </ModalContainer>
  );
};

export default ChannelPasswordModal;
