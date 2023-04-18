import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyPage from './pages/MyPage';

const App: React.FC = () => {
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
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
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
