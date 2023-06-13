import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import selectAuth from '../../features/auth/authSelector';
import useCallApi from '../../utils/useCallApi';

const Nickname: React.FC = () => {
  const callApi = useCallApi();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [isValid, setIsValid] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string>('');

  const handleNicknameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNickname(event.target.value);
    },
    [],
  );

  useEffect(() => {
    if (!isValid) return;
    const config = {
      url: `/api/v1/users/${myId}/nickname`,
      method: 'put',
      data: { nickname },
    };
    try {
      callApi(config);
    } catch (error) {
      setIsValid(false);
    }
  }, [isValid]);

  useEffect(() => {
    if (!nickname) return;
    const timeoutId = setTimeout(() => {
      const regex = /^[a-zA-Z0-9]{4,14}$/;
      setIsValid(regex.test(nickname));
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [nickname]);

  return (
    <label htmlFor="nickname" className="max-w-md space-y-1.5">
      Nickname
      <input
        type="text"
        id="nickname"
        value={nickname}
        onChange={handleNicknameChange}
        className={`mt-4 w-full rounded px-4 py-2 text-gray-900 focus:outline-none ${
          isValid ? 'border' : 'border-2 border-red-500'
        }`}
      />
      {!isValid && (
        <p className="pl-2.5 text-left text-xs text-red-500">
          Sorry, only letters(English) and numbers are allowed between 4 and 14
          characters long.
        </p>
      )}
    </label>
  );
};

export default Nickname;
