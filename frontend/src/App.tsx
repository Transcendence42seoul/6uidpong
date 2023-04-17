import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import MyPage from './MyPage';

const App: React.FC = () => {
  const handleLogin = () => {
    // 사용자를 인증 서버로 리다이렉션
    const url = 'http://localhost:8080/api/v1/auth/social/redirect/forty-two';
    window.location.href = url;
  };

  const profile = {
    nickname: 'wocheon',
    picture: 'https://ca.slack-edge.com/T039P7U66-U049ZSEBJJC-3f8c94153ce0-512',
  };

  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/my-page"
          element={<MyPage profile={profile} stats={stats} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
