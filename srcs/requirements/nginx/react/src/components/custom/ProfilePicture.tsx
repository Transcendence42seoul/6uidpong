import React, { useState } from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// 가상의 DB 데이터
const dbData = [
  { id: 1, name: 'User1' },
  { id: 2, name: 'User2' },
  { id: 3, name: 'User3' },
];

function ProfilePicture() {
  const [picture, setPicture] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPicture(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 가상의 DB 요청 처리
    const mock = new MockAdapter(axios);
    // GET 요청에 대한 응답 설정
    mock.onGet('/users').reply(200, dbData);
    // POST 요청에 대한 응답 설정
    mock.onPost('/users').reply(200, { message: '사진 제출 완료' });

    // POST 요청 보내기
    axios.post('/users', { picture })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div>
      <h2>프로필 사진 추가</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} />
        <button type="submit" className="absolute right-0 top-0 m-4 rounded border-2 p-2.5">제출</button>
      </form>
    </div>
  );
}

export default ProfilePicture;