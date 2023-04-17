import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';

const App: React.FC = () => {
  const handleLogin = () => {
    // 사용자를 인증 서버로 리다이렉션
    const url = `http://localhost:8080/api/v1/auth/social/redirect/forty-two`;
    window.location.href = url;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
