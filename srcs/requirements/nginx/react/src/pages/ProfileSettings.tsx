import React from 'react';
import Nickname from '../components/custom/Nickname';
import ContentBox from '../components/container/ContentBox';
import ProfilePicture from '../components/custom/ProfilePicture';
import TwoFactorAuth from '../components/custom/TwoFactorAuth';

interface ProfileSettingsProps {
  id: number;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ id }) => {
  return (
    <div className="flex flex-col items-center p-4">
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <Nickname id={id} />
      </ContentBox>
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <ProfilePicture id={id} />
      </ContentBox>
      <ContentBox className="mb-4 w-full max-w-md flex-col border p-4">
        <TwoFactorAuth id={id} />
      </ContentBox>
    </div>
  );
};

export default ProfileSettings;
