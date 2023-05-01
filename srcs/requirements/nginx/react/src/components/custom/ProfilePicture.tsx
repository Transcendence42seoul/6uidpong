import React, { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import HoverButton from '../button/HoverButton';

interface ProfileProps {
  id: number;
}

const ProfilePicture: React.FC<ProfileProps> = ({ id }) => {
  const [picture, setPicture] = useState('');
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleSubmit = () => {
    axios
      .put(
        `api/v1/users/${id}/profileImage`,
        { profileImage: picture },
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
    <div>
      <h1>프로필 사진 추가</h1>
      <input
        type="text"
        name="picture"
        onChange={(event) => setPicture(event.target.value)}
        className="my-4 w-full max-w-md rounded-md border border-gray-400 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <HoverButton onClick={handleSubmit}>전송</HoverButton>
    </div>
  );
};

export default ProfilePicture;
