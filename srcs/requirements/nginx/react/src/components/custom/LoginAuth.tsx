import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import HoverButton from '../button/HoverButton';

interface LoginAuthProps {
  id: number | null;
}

const LoginAuth: React.FC<LoginAuthProps> = ({ id }) => {
  const [code, setCode] = useState('');

  const handleVerificationCode = async () => {
    axios
      .post('/api/v1/auth/verificationCode', { id, code })
      .then((response: AxiosResponse<{ result: boolean }>) => {
        alert('인증번호가 이메일로 전송되었습니다.');
        sessionStorage.clear();
        window.history.go(-1);
      })
      .catch((error: AxiosError) => {
        alert('인증번호 틀린듯?');
      });
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.go(1);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div>
      <h1 className="mt-5 text-2xl font-bold text-white">Verification Code</h1>
      <input
        type="text"
        name="code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton
        onClick={handleVerificationCode}
        className="my-2 w-full max-w-md rounded border p-2.5"
      >
        Submit
      </HoverButton>
    </div>
  );
};

export default LoginAuth;
