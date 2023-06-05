import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import HoverButton from '../button/HoverButton';
import ModalContainer from '../container/ModalContainer';
import ContentBox from '../container/ContentBox';

interface PasswordModalProps {
  onConfirmClick: () => void;
  setShowModal: (showModal: boolean) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  onConfirmClick,
  setShowModal,
}) => {
  const [password, setPassword] = useState<string>('');

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    onConfirmClick();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirmClick();
    }
  };

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="space-y-4 p-4">
          <label htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="focus:shadow-outline mt-2 w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none"
            />
          </label>
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
        </ContentBox>
      </div>
    </ModalContainer>
  );
};

export default PasswordModal;
