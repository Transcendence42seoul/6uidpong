import React from 'react';
import Nickname from '../components/custom/Nickname';
import ProfilePicture from '../components/custom/ProfilePicture';

const Profile: React.FC = () => {
  return (
    <div>
      <Nickname />
      <ProfilePicture />
    </div>
  );
};

export default Profile;
