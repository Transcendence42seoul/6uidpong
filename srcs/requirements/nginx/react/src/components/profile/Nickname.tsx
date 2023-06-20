import React, { useCallback, useEffect, useState } from 'react';

import selectAuth from '../../features/auth/authSelector';
import HttpStatus from '../../utils/HttpStatus';
import useCallApi from '../../utils/useCallApi';
import HoverButton from '../common/HoverButton';

const Nickname: React.FC = () => {
  const callApi = useCallApi();

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [nickname, setNickname] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

  const handleNicknameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(event.target.value);
    },
    [],
  );

  const handleOkClick = () => {
    const config = {
      url: `/api/v1/users/${myId}/nickname`,
      method: 'put',
      data: { nickname },
    };
    callApi(config);
  };

  useEffect(() => {
    if (warning) return;
    const validateNickname = async () => {
      const config = {
        url: '/api/v1/users/check-nickname',
        method: 'post',
        data: { nickname },
      };
      try {
        await callApi(config);
      } catch (error) {
        if (!HttpStatus.isConflict(error)) {
          throw error;
        }
        setWarning('That nickname is taken. Try another.');
      }
    };
    validateNickname();
  }, [warning]);

  useEffect(() => {
    if (!nickname) return;
    const timeoutId = setTimeout(() => {
      const regex = /^[a-zA-Z0-9]+$/;
      if (!regex.test(nickname)) {
        setWarning('Sorry, only letters(English) and numbers are allowed.');
      } else if (nickname.length < 4 || nickname.length > 14) {
        setWarning('Sorry, your nickname must be between 4 and 14 characters.');
      } else {
        setWarning('');
      }
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [nickname]);

  return (
    <form className="space-y-1.5">
      Nickname
      <div className="flex items-end leading-tight">
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={handleNicknameChange}
          className={`focus:shadow-outline mt-2 w-full border px-3 py-2 text-gray-700 focus:outline-none ${
            warning ? 'border-2 border-red-500' : 'border'
          }`}
        />
        <HoverButton onClick={handleOkClick} className="h-full border p-2">
          OK
        </HoverButton>
      </div>
      <p className="pl-2.5 text-left text-xs text-red-500">{warning}</p>
    </form>
  );
};

export default Nickname;
