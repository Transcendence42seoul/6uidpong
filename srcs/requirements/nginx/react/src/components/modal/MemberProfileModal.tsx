import React from 'react';

import type User from '../../interfaces/User';

interface MemberProfileModalProps {
  member: User;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member }) => {
  const { nickname, image } = member;

  return (
    <div className="fixed inset-0 flex justify-center space-x-8 bg-black bg-opacity-50 pt-40" />
  );
};

export default MemberProfileModal;
