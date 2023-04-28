import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setAccessToken } from './authSlice';
import { RootState } from './store';
import Loading from './pages/Loading';
import Login from './pages/Login';
import Main from './pages/Main';
import MyPage from './pages/MyPage';
import Profile from './pages/Profile';
import LoginAuth from './components/custom/LoginAuth';

const App: React.FC = () => {
  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };
  const dispatch = useDispatch();
  const { tokenInfo } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    const fetchToken = async () => {
      const code = url.searchParams.get('code');
      const response = await axios.get<{
        accessToken: string;
      }>('/api/v1/auth/social/callback/forty-two', {
        params: {
          code,
        },
      });
      const { accessToken: token } = response.data;
      dispatch(setAccessToken(token));
    };

    const fetchData = async () => {
      if (url.pathname === '/auth/social/callback/forty-two') {
        setLoading(true);
        await fetchToken();
        window.location.href = 'https://localhost/profile';
      }
    };

    fetchData();
  }, []);

  if (!tokenInfo) {
    if (loading) {
      return <Loading />;
    }
    return <Login />;
  }

  if (tokenInfo.isTwoFactor) {
    return <LoginAuth id={tokenInfo.id} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/profile" element={<Profile id={tokenInfo.id} />} />
        <Route
          path="/my-page"
          element={<MyPage id={tokenInfo.id} stats={stats} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
