import axios, { AxiosResponse, AxiosError } from 'axios';
import React, { useState, ChangeEvent } from 'react';

import selectAuth from '../../features/auth/authSelector';
import HoverButton from '../button/HoverButton';

const ProfilePicture: React.FC = () => {
  const { accessToken, tokenInfo } = selectAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const myId = tokenInfo?.id;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      axios
        .put(
          `api/v1/users/${myId}/image`,
          { formData },
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
    }
  };

  return (
    <>
      <h1>프로필 사진 추가</h1>
      <input
        type="file"
        accept="image/jpeg"
        size={200000}
        name="image"
        onChange={handleFileChange}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton onClick={handleUpload}>Upload</HoverButton>
    </>
  );
};

export default ProfilePicture;
