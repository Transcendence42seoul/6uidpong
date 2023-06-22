import axios, { AxiosResponse, AxiosError } from 'axios';
import React, { useState } from 'react';

import selectAuth from '../../features/auth/authSelector';
import HoverButton from '../common/HoverButton';
import Modal from '../modal/Modal';

const TwoFactorAuth: React.FC = () => {
  const { accessToken, tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [code, setCode] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleCloseModal = () => {
    setCode('');
    setOpenModal(false);
    if (sessionStorage) sessionStorage.clear();
  };

  const handleSetIs2faVerified = () => {
    setOpenModal(true);
    // 이메일 보내는 POST 요청 처리
    axios.put(`/api/v1/users/${myId}/email/code`, null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  const handleVerifyVerificationCode = () => {
    // 인증코드를 서버로 보내는 POST 요청 처리

    axios
      .put(
        `/api/v1/users/${myId}/is2fa`,
        { code, is2FA: true },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then((response: AxiosResponse<boolean>) => {
        // 인증코드가 올바른 경우, 추가 로직 처리
        alert('Authentification succeed.');
        handleCloseModal();
      })
      .catch((error: AxiosError) => {
        alert('Authentification failed.');
      });
  };

  return (
    <>
      <HoverButton
        onClick={handleSetIs2faVerified}
        className="w-full max-w-md border p-4"
      >
        Activate Authentication
      </HoverButton>
      <Modal isOpen={openModal} onClose={handleCloseModal}>
        <div style={{ pointerEvents: 'auto' }}>
          {openModal && (
            <>
              <h1 className="text-2xl font-bold text-white">
                Verify Two-Factor Authentication
              </h1>
              <h1 className="mt-5 text-2xl font-bold text-white">
                Verification Code
              </h1>
              <input
                type="text"
                name="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <HoverButton
                onClick={handleVerifyVerificationCode}
                className="my-2 w-full max-w-md rounded border p-2.5"
              >
                Submit
              </HoverButton>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TwoFactorAuth;
