import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import handleAuthInfo from '../../authInfo';
import redirect from '../../redirect';
import HoverButton from '../button/HoverButton';

interface LoginAuthProps {
  id: number | null;
}

const LoginAuth: React.FC<LoginAuthProps> = ({ id }) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState('');

  const handleVerificationCode = async () => {
    try {
      const { data } = await axios.post('/api/v1/auth/2fa', {
        id,
        code,
      });
      await handleAuthInfo(data, dispatch);
      alert('인증 완료');
      redirect('/');
    } catch {
      alert('인증번호 틀린듯?');
    }
  };

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
