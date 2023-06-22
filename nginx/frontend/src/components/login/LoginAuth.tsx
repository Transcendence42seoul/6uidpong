import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import dispatchAuth from '../../features/auth/authAction';
import redirect from '../../utils/redirect';
import HoverButton from '../common/HoverButton';

interface LoginAuthProps {
  id: number | undefined;
}

const LoginAuth: React.FC<LoginAuthProps> = ({ id }) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState<string>('');

  const handleVerificationCode = async () => {
    try {
      const { data } = await axios.post('/api/v1/auth/2fa', {
        id,
        code,
      });
      await dispatchAuth(data, dispatch);
      alert('Authentification succeed.');
      redirect('/');
    } catch {
      alert('Authentification failed.');
    }
  };

  return (
    <>
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
    </>
  );
};

export default LoginAuth;
