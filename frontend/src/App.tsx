import axios from 'axios';
import jwt_decode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyPage from './pages/MyPage';

interface AccessToken {
  id: string;
  nickname: string;
  isTwoFactor: string;
}

const App: React.FC = () => {
  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };
  const [accessToken, setAccessToken] = useState<AccessToken | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const response = await axios.get(
        '/api/v1/auth/social/callback/forty-two',
        {
          params: {
            code,
          },
        },
      );
      const { accessToken: jwt } = response.data;
      const payload = jwt_decode<AccessToken>(jwt);
      setAccessToken(payload);
    };

    if (
      window.location.href ===
      'https://localhost/auth/social/callback/forty-two'
    ) {
      fetchToken();
    }
  }, [window.location.href]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-page" element={<MyPage stats={stats} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
