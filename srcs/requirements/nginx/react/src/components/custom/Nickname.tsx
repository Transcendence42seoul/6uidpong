import React, { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import HoverButton from '../button/HoverButton';

interface NicknameProps {
  id: number;
}

const Nickname: React.FC<NicknameProps> = ({ id }) => {
  const [nickname, setNickname] = useState('');
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleNickname = () => {
    axios
      .put(
        `api/v1/users/${id}/nickname`,
        { nickname },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then((response: AxiosResponse<void>) => {
        alert('닉네임 변경 완료');
      })
      .catch((error: AxiosError) => {
        alert('닉네임 변경 실패');
      });
  };
  return (
    <div>
      <h1>닉네임 변경</h1>
      <input
        type="text"
        name="nickname"
        onChange={(event) => setNickname(event.target.value)}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton onClick={handleNickname}>전송</HoverButton>
    </div>
  );
};

export default Nickname;
