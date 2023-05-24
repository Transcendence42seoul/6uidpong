import React, { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import selectAuth from '../../features/auth/authSelector';
import HoverButton from '../button/HoverButton';

const ProfilePicture: React.FC = () => {
  const { accessToken, tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const [image, setImage] = useState<string>('');

  const handleSubmit = () => {
    console.log(image);
    axios
      .put(
        `api/v1/users/${myId}/image`,
        { image },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then((response: AxiosResponse<void>) => {
        alert('전송에 성공했습니다.');
      })
      .catch((error: AxiosError) => {
        alert('전송에 실패했습니다.');
      });
  };

  return (
    <>
      <h1>프로필 사진 추가</h1>
      <input
        type="text"
        name="image"
        onChange={(event) => setImage(event.target.value)}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton onClick={handleSubmit}>전송</HoverButton>
    </>
  );
};

export default ProfilePicture;
