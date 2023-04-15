import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div>
      <h1>6uidpong</h1>
      <button onClick={onLogin}>42 Login</button>
    </div>
  );
};

export default Login;
