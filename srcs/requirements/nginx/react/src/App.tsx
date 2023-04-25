import axios from 'axios';
import jwt_decode from 'jwt-decode';
import React, { useEffect } from 'react';
// import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyPage from './pages/MyPage';

interface AccessToken {
  id: number;
  nickname: string;
  isTwoFactor: boolean;
}

const App: React.FC = () => {
  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };
  const navigate = useNavigate();
  // const [jwt, setJwt] = useState<string | null>(null);
  // const [accessToken, setAccessToken] = useState<AccessToken | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);

    const fetchToken = async () => {
      const code = url.searchParams.get('code');
      const response = await axios.get(
        '/api/v1/auth/social/callback/forty-two',
        {
          params: {
            code,
          },
        },
      );
      const { accessToken: token } = response.data;
      localStorage.setItem('accessToken', token);
      // const payload = jwt_decode<AccessToken>(token);
      // setAccessToken(payload);
    };

    const callAPI = async () => {
      try {
        await axios.get(url.pathname, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (error) {
        localStorage.removeItem('accessToken');
        // setAccessToken(null);
      }
    };

    const fetchData = async () => {
      if (url.pathname === '/auth/social/callback/forty-two') {
        await fetchToken();
        navigate('/profile');
        return;
      }
      await callAPI();
    };

    fetchData();
  }, []);

  return (
    <BrowserRouter>
      {localStorage.getItem('accessToken') ? (
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/my-page"
            element={
              <MyPage
                id={
                  jwt_decode<AccessToken>(
                    localStorage.getItem('accessToken') ?? '',
                  ).id
                }
                stats={stats}
              />
            }
          />
        </Routes>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
