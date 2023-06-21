import axios from 'axios';
import React, { useState } from 'react';

import selectAuth from '../../features/auth/authSelector';
import HoverButton from '../common/HoverButton';

const ProfilePicture: React.FC = () => {
  const { accessToken, tokenInfo } = selectAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const myId = tokenInfo?.id;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.put(`api/v1/users/${myId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      alert('전송에 성공했습니다.');
    } catch (e) {
      alert('전송에 실패했습니다.');
    }
  };

  return (
    <>
      <h1>Image</h1>
      <input
        type="file"
        accept="image/jpeg"
        size={200000}
        name="image"
        onChange={handleFileChange}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton onClick={handleUpload} className="border p-2">
        Upload
      </HoverButton>
    </>
  );
};

export default ProfilePicture;
