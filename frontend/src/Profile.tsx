import React from 'react';
import Nickname from './Nickname';
import ProfilePicture from './Profilepicture';

const Profile: React.FC = ({}) => {
  return (
    <div>
      <Nickname />
      <ProfilePicture />
    </div>
  );
};

export default Profile;
