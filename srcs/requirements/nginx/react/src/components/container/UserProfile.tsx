import React from 'react';

import CircularImage from './CircularImage';
import ContentBox from './ContentBox';

import type User from '../../interfaces/User';

interface UserProfileProps {
  user: User;
  className?: string;
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  className = '',
  children = null,
}) => {
  const { nickname, image } = user;

  return (
    <div className={className}>
      <ContentBox className="p-4">
        <h2 className="text-lg font-semibold">{nickname}</h2>
        <CircularImage src={image} alt={nickname} className="m-2.5 h-32 w-32" />
        {children}
      </ContentBox>
    </div>
  );
};

export default UserProfile;
