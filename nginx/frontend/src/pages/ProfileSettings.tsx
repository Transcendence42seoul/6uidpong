import React from 'react';

import ContentBox from '../components/common/ContentBox';
import TwoFactorAuth from '../components/login/TwoFactorAuth';
import Nickname from '../components/profile/Nickname';
import ProfilePicture from '../components/profile/ProfilePicture';

const ProfileSettings: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <ContentBox className="mb-4 w-full max-w-md flex-col border bg-black p-4">
        <Nickname />
      </ContentBox>
      <ContentBox className="mb-4 w-full max-w-md flex-col border bg-black p-4">
        <ProfilePicture />
      </ContentBox>
      <TwoFactorAuth />
    </div>
  );
};

export default ProfileSettings;
