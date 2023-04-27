import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios, { AxiosResponse, AxiosError } from 'axios';
import HoverButton from '../button/HoverButton';
import { setAccessToken } from '../../authSlice';

interface LoginProps {
  element: {
    id: number;
    token: string;
  };
}

const LoginAuth: React.FC<LoginProps> = ({ element: { id, token } }) => {
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const { tokenInfo } = useSelector((state: RootState) => state.auth);

  const handleVerifyVerificationCode = () => {
    axios
      .post('/api/v1/auth/verifyCode', { id, code })
      .then((response: AxiosResponse<{ result: boolean }>) => {
        alert('인증에 성공하였습니다');
        sessionStorage.clear();
        dispatch(setAccessToken(token));
      })
      .catch((error: AxiosError) => {
        alert('인증코드가 잘못되었습니다.');
      });
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        Verify Two-Factor Authentication
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
    </div>
  );
};

export default LoginAuth;
