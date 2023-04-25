import React, { useState } from 'react';
import axios from 'axios';

const ProfilePicture = () => {
  const [picture, setPicture] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPicture(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // POST 요청 보내기
    axios
      .post('/users', { picture })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h2>프로필 사진 추가</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} />
        <button
          type="submit"
          className="absolute right-0 top-0 m-4 rounded border-2 p-2.5"
        >
          제출
        </button>
      </form>
    </div>
  );
};

export default ProfilePicture;
