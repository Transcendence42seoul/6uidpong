import React, { useRef, useState } from 'react';

import MemberProfileModal from '../modal/MemberProfileModal';
import CircularImage from './CircularImage';

import type User from '../../interfaces/User';

interface ChannelMemberListProps {
  members: User[];
  className?: string;
}

const ChannelMemberList: React.FC<ChannelMemberListProps> = ({
  members,
  className = '',
}) => {
  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>(members);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showMemberProfileModal, setShowMemberProfileModal] =
    useState<boolean>(false);

  const handleMemberClick = (member: User) => {
    setSelectedMember(member);
    setShowMemberProfileModal(true);
  };

  const handleSearchResults = async (results: User[]) => {
    setSearchResults([...results]);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const keyword = event.target.value;
    setSearch(keyword);
    if (keyword) {
      const results = members.filter((member) => {
        return member.nickname.startsWith(keyword);
      });
      await handleSearchResults(results);
    } else {
      await handleSearchResults(members);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search members"
        value={search}
        onChange={handleSearchChange}
        className="w-full rounded border border-white p-2 shadow"
      />
      <ul
        className="absolute z-10 flex w-full flex-col rounded border-2 bg-white px-2.5 pb-2 pt-1.5 shadow-md"
        ref={searchResultsRef}
      >
        {searchResults.map((member) => {
          const { nickname, image, isOwner, isAdmin } = member;
          let role = '';
          if (isOwner) {
            role = 'Owner';
          } else if (isAdmin) {
            role = 'Admin';
          }
          return (
            <button
              key={nickname}
              className="flex items-end space-x-2 border-b border-gray-300 py-1 hover:bg-gray-200"
              onClick={() => handleMemberClick(member)}
            >
              <CircularImage src={image} alt={nickname} className="h-6 w-6" />
              <span className="w-2/3 truncate text-left">{nickname}</span>
              <span className="ml-auto text-sm">{role}</span>
            </button>
          );
        })}
      </ul>
      {selectedMember && showMemberProfileModal && (
        <MemberProfileModal member={selectedMember} />
      )}
    </div>
  );
};

export default ChannelMemberList;
