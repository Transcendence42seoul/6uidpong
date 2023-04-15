import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return <button onClick={onLogin}>Login</button>;
};

export default Login;
