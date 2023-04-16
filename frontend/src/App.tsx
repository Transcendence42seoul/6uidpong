import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Nickname from "./Nickname";
import ProfilePicture from "./Profilepicture";

const client_id = 'CLIENT_ID';
const client_secret = 'CLIENT_SECRET';
const redirect_uri = 'REDIRECT_URI';

const App: React.FC = () => {
  useEffect(() => {
    // 쿼리 문자열에 인증 코드가 있는지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // 인증 코드로부터 액세스 토큰 요청
      fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id,
          client_secret,
          code,
          redirect_uri,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // 액세스 토큰 저장
          localStorage.setItem('access_token', data.access_token);
        });
    }
  }, []);

  const handleLogin = () => {
    // 사용자를 인증 서버로 리다이렉션
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
    window.location.href = url;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
