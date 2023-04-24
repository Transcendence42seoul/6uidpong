import React, { useState } from 'react';

const Nickname = () => {
  const [nickname, setNickname] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
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
