import React, { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import HoverButton from '../button/HoverButton';
import Modal from '../modal/Modal';

interface TwoFactorAuthProps {
  id: number;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ id }) => {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sendmail, setSendmail] = useState(false);
  const [code, setCode] = useState('');

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSetIsTwoFactorVerified = () => {
    // 이메일 보내는 POST 요청 처리
    axios
      .post('/api/v1/auth/isTwoFactor', { id, email })
      .then((response: AxiosResponse<{ result: boolean }>) => {
        // 이메일이 성공적으로 보내진 경우, 인증코드 작성 창이 나타나도록 상태 변경
        setSendmail(true);
      })
      .catch((error: AxiosError) => {
        alert('이메일 잘못된듯');
      });
  };

  const handleVerifyVerificationCode = () => {
    // 인증코드를 서버로 보내는 POST 요청 처리
    axios
      .post('/api/v1/auth/verifyVerificationCode', { code })
      .then((response: AxiosResponse<{ result: boolean }>) => {
        // 인증코드가 올바른 경우, 추가 로직 처리
        alert('2차 인증 완료!');
      })
      .catch((error: AxiosError) => {
        alert('인증번호 틀렸음');
      });
  };

  return (
    <div>
      <HoverButton onClick={handleOpenModal}>인증 활성화</HoverButton>
      <Modal isOpen={openModal} onClose={handleCloseModal}>
        <div style={{ pointerEvents: 'auto' }}>
          {openModal && (
            <>
              <h1 className="text-2xl font-bold text-white">
                Verify Two-Factor Authentication
              </h1>
              <p className="mt-5 text-white">
                Please enter your email address to receive a verification code.
              </p>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={sendmail}
                className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <HoverButton
                onClick={handleSetIsTwoFactorVerified}
                className="my-2 w-full max-w-md rounded border p-2.5"
                disabled={sendmail}
              >
                Verify
              </HoverButton>
              {sendmail && (
                <>
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
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TwoFactorAuth;
