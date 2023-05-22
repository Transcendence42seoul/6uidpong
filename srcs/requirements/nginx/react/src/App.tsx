import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import LoginAuth from './components/custom/LoginAuth';
import dispatchAuth from './features/auth/authAction';
import selectAuth from './features/auth/authSelector';
import AllChannels from './pages/AllChannels';
import ChannelList from './pages/ChannelList';
import DmRoom from './pages/DmRoom';
import DmRoomList from './pages/DmRoomList';
import FriendRequests from './pages/FriendRequests';
import FriendsList from './pages/FriendsList';
import Loading from './pages/Loading';
import Login from './pages/Login';
import Main from './pages/Main';
import MyPage from './pages/MyPage';
import ProfileSettings from './pages/ProfileSettings';
import UserProfile from './pages/UserProfile';
import redirect from './utils/redirect';
import Layout from './Layout';
// import { mockTokenInfo as tokenInfo } from './mock'; // test
// const { id, is2FA, accessToken } = selectAuth(); // test

const App: React.FC = () => {
  const stats = {
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  };

  const [loading, setLoading] = useState<boolean>(false);
  const { id, is2FA, accessToken, tokenInfo } = selectAuth();

  const dispatch = useDispatch();
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
      await dispatchAuth(data, dispatch);
      const pathname = status === 201 ? '/profile-settings' : '/';
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
  socket.on('connect', () => {
    socket.emit('connection');
  });

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/channel" element={<ChannelList socket={socket} />} />
        <Route path="/channel/all" element={<AllChannels socket={socket} />} />
        <Route path="/dm" element={<DmRoomList socket={socket} />} />
        <Route
          path="/dm/:roomId"
          element={<DmRoom myId={tokenInfo.id} socket={socket} />}
        />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends-list" element={<FriendsList />} />
        <Route
          path="/my-page"
          element={<MyPage id={tokenInfo.id} stats={stats} />}
        />
        <Route
          path="/profile/:userId"
          element={<UserProfile socket={socket} />}
        />
        <Route
          path="/profile-settings"
          element={<ProfileSettings id={tokenInfo.id} />}
        />
      </Routes>
    </Layout>
  );
};

export default App;
