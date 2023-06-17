import React, { useCallback, useEffect, useState } from 'react';

import HoverButton from '../common/HoverButton';
import ModalContainer from '../container/ModalContainer';
import ContentBox from '../common/ContentBox';

interface PasswordModalProps {
  isWrongPassword: boolean;
  onConfirmClick: (password: string) => void;
  setShowModal: (showModal: boolean) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isWrongPassword,
  onConfirmClick,
  setShowModal,
}) => {
  const [password, setPassword] = useState<string>('');

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    onConfirmClick(password);
    setPassword('');
  };

  const handleEnterKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirmClick();
    }
  };

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEnterKeydown);
    return () => {
      document.removeEventListener('keydown', handleEnterKeydown);
    };
  }, []);

  return (
    <ModalContainer setShowModal={setShowModal}>
      <div>
        <ContentBox className="space-y-4 bg-black p-4">
          <label htmlFor="password" className="space-y-1.5">
            Password
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`focus:shadow-outline mt-2 w-full rounded px-3 py-2 leading-tight text-gray-700 focus:outline-none ${
                isWrongPassword ? 'border-2 border-red-500' : 'border'
              }`}
            />
            {isWrongPassword && (
              <p className="pl-2.5 text-left text-xs text-red-500">
                Wrong password.
              </p>
            )}
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
