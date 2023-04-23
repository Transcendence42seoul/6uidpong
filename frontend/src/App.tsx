import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Main from './pages/Main';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyPage from './pages/MyPage';

const App: React.FC = () => {
  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };

  useEffect(() => {
    async function sendAuthCode() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      await axios.get('/api/v1/auth/social/callback/forty-two', {
        params: {
          code,
        },
      });
    }

    if (
      window.location.href ===
      'https://localhost/auth/social/callback/forty-two'
    ) {
      sendAuthCode();
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
