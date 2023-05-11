import React from 'react';
import { useNavigate } from 'react-router-dom';
import HoverButton from '../components/button/HoverButton';
import Nickname from '../components/custom/Nickname';
import ContentBox from '../components/container/ContentBox';
import ProfilePicture from '../components/custom/ProfilePicture';
import TwoFactorAuth from '../components/custom/TwoFactorAuth';

interface ProfileProps {
  id: number;
}

const Profile: React.FC<ProfileProps> = ({ id }) => {
  const navigate = useNavigate();

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
      <HoverButton
        onClick={() => navigate('/')}
        className="mb-4 w-full max-w-md rounded border p-2.5"
      >
        Home
      </HoverButton>
    </div>
  );
};

export default Profile;
