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
    <div className="flex flex-col items-center pt-16">
      <h1 className="my-4 text-xl font-bold text-white">Verification Code</h1>
      <div className="flex">
        <input
          type="text"
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="rounded border border-gray-400 px-4 py-2.5 text-gray-900 focus:border-transparent focus:outline-none"
        />
        <HoverButton
          onClick={handleVerificationCode}
          className="rounded border p-2.5"
        >
          Submit
        </HoverButton>
      </div>
    </div>
  );
};

export default LoginAuth;
