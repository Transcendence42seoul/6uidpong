import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setAuthInfo } from './authSlice';
import { RootState } from './store';
import Loading from './pages/Loading';
import Login from './pages/Login';
import Main from './pages/Main';
import MyPage from './pages/MyPage';
import Profile from './pages/Profile';
import LoginAuth from './components/custom/LoginAuth';

interface AuthInfo {
  id: number | null;
  is2FA: boolean;
  accessToken: string | null;
}

const App: React.FC = () => {
  const stats = {
    wins: 4,
    losses: 2,
    ladderScore: 4242,
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };

  const { id, is2FA, tokenInfo } = useSelector(
    (state: RootState) => state.auth,
  );

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    const fetchAuth = async () => {
      const code = url.searchParams.get('code');
      const { data } = await axios.get<AuthInfo>(
        '/api/v1/auth/social/callback/forty-two',
        {
          params: {
            code,
          },
        },
      );
      dispatch(setAuthInfo(data));
    };

    const fetchData = async () => {
      setLoading(true);
      await fetchAuth();
      window.location.href = `${url.origin}/profile`;
    };

    if (url.pathname === '/auth/social/callback/forty-two') {
      fetchData();
    }
  }, []);

  if (!tokenInfo) {
    if (is2FA) {
      return <LoginAuth id={id} />;
    }
    if (loading) {
      return <Loading />;
    }
    return <Login />;
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
