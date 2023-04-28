import React, { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';

const Nickname = () => {
  const [nickname, setNickname] = useState('');
  const [timerId, setTimerId] = useState(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.value;
    setNickname(inputName);

    // 타이머가 실행중이면 이전 타이머를 취소합니다.
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      // 서버에 변경된 데이터를 전송하는 코드를 작성합니다.
    }, 1000);
  };
  return (
    <div>
      <h2>{nickname}</h2>
      <h2>닉네임 변경</h2>
      <input type="text" value={nickname} onChange={handleChange} />
      <button>변경</button>
    </div>
  );
};
export default Nickname;
