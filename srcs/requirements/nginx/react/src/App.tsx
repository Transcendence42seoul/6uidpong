import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setAccessToken } from './authSlice';
import { RootState } from './store';
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
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const tokenInfo = useSelector((state: RootState) => state.auth.tokenInfo);

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
      dispatch(setAccessToken(token));
    };

    const callAPI = async () => {
      try {
        await axios.get(url.pathname, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        dispatch(setAccessToken(null));
      }
    };

    const fetchData = async () => {
      if (url.pathname === '/auth/social/callback/forty-two') {
        await fetchToken();
        window.location.href = 'https://localhost/profile';
        return;
      }
      callAPI();
    };

    fetchData();
  }, []);

  return (
    <BrowserRouter>
      {tokenInfo ? (
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/my-page"
            element={<MyPage id={tokenInfo.id} stats={stats} />}
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
