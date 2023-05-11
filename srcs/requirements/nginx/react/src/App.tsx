import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import handleAuthInfo from './authInfo';
import redirect from './redirect';
import { RootState } from './store';
import ChatRoom from './pages/ChatRoom';
import ChatRoomList from './pages/ChatRoomList';
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

  const { id, is2FA, accessToken, tokenInfo } = useSelector(
    (state: RootState) => state.auth,
  );

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleLoading = async () => {
    setLoading(true);
  };

  useEffect(() => {
    const url = new URL(window.location.href);

    const fetchAuth = async () => {
      const code = url.searchParams.get('code');
      const { data, status } = await axios.post(
        '/api/v1/auth/social/callback/forty-two',
        { code },
      );
      await handleAuthInfo(data, dispatch);
      const pathname = status === 201 ? '/profile' : '/';
      redirect(pathname, url);
    };

    const fetchData = async () => {
      await handleLoading();
      await fetchAuth();
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

  const socket = io({ auth: { token: accessToken } });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/chat" element={<ChatRoomList socket={socket} />} />
        <Route
          path="/chat/:roomId"
          element={<ChatRoom myId={id} socket={socket} />}
        />
        <Route
          path="/my-page"
          element={<MyPage id={tokenInfo.id} stats={stats} />}
        />
        <Route path="/profile" element={<Profile id={tokenInfo.id} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
