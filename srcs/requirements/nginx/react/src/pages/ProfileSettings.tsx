import React from 'react';
import ContentBox from '../components/container/ContentBox';
import Nickname from '../components/custom/Nickname';
import ProfilePicture from '../components/custom/ProfilePicture';
import TwoFactorAuth from '../components/custom/TwoFactorAuth';

const ProfileSettings: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <Nickname />
      </ContentBox>
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <ProfilePicture />
      </ContentBox>
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <TwoFactorAuth />
      </ContentBox>
    </div>
  );
};

export default ProfileSettings;
