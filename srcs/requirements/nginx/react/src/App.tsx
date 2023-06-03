import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

import LoginAuth from './components/custom/LoginAuth';
import dispatchAuth from './features/auth/authAction';
import selectAuth from './features/auth/authSelector';
import dispatchSocket from './features/socket/socketAction';
import Layout from './Layout';
import AllChannels from './pages/AllChannels';
import BlockList from './pages/BlockList';
import Channel from './pages/Channel';
import ChannelList from './pages/ChannelList';
import ChannelSettings from './pages/ChannelSettings';
import DmRoom from './pages/DmRoom';
import DmRoomList from './pages/DmRoomList';
import FriendRequests from './pages/FriendRequests';
import FriendsList from './pages/FriendsList';
import GameList from './pages/GameList';
import Loading from './pages/Loading';
import Login from './pages/Login';
import Main from './pages/Main';
import MyPage from './pages/MyPage';
import ProfileSettings from './pages/ProfileSettings';
import redirect from './utils/redirect';

import { isTest, mockAuthState } from './mock'; // test

const App: React.FC = () => {
  const dispatch = useDispatch();

  const stats = {
    recentHistory: ['Win', 'Loss', 'Win', 'Win', 'Loss'],
  }; // test

  const { id, is2FA, accessToken, tokenInfo } = isTest
    ? mockAuthState
    : selectAuth(); // test

  const [loading, setLoading] = useState<boolean>(false);

  const handleLoading = async () => {
    setLoading(true);
  };

  const initSocket = async () => {
    const socket = io('/chat', { auth: { token: accessToken } });
    socket.on('connect', () => {
      socket.emit('connection');
    });
    await dispatchSocket({ socket }, dispatch);
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

  initSocket();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/all-channels" element={<AllChannels />} />
        <Route path="/block-list" element={<BlockList />} />
        <Route path="/channel" element={<ChannelList />} />
        <Route path="/channel/:channelId" element={<Channel />} />
        <Route path="/channel-settings" element={<ChannelSettings />} />
        <Route path="/custom" element={<GameList />} />
        <Route path="/dm" element={<DmRoomList />} />
        <Route path="/dm/:roomId" element={<DmRoom />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends-list" element={<FriendsList />} />
        <Route path="/my-page" element={<MyPage stats={stats} />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
      </Routes>
    </Layout>
  );
};

export default App;
