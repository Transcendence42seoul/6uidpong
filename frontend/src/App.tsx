import React, { useEffect } from 'react';

const client_id = 'CLIENT_ID';
const client_secret = 'CLIENT_SECRET';
const redirect_uri = 'REDIRECT_URI';

function App() {
  const handleLogin = () => {
    // 사용자를 인증 서버로 리다이렉션
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
    window.location.href = url;
  };

  return (
    <div>
      <h1>6uidpong</h1>
      <button onClick={handleLogin}>42 Login</button>
    </div>
  );
}

export default App;
