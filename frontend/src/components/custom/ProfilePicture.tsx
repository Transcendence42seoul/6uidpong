import React, { useState } from 'react';

const ProfilePicture = () => {
  const [picture, setPicture] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPicture(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`사진 제출: ${picture}`);
  };

  return (
    <div>
      <h2>프로필 사진 추가</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} />
        <button type="submit">제출</button>
      </form>
    </div>
  );
};

export default ProfilePicture;
