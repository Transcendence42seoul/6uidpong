import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
