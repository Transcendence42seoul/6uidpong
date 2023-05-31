import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { useParams } from 'react-router-dom';
import ChannelMemberProfile from './ChannelMemberProfile';
import CircularImage from './CircularImage';
import ModalContainer from './ModalContainer';

import type User from '../../interfaces/User';

import { isTest, mockUsers } from '../../mock'; // test

interface ChannelMemberListProps {
  socket: Socket;
  className?: string;
}

const ChannelMemberList: React.FC<ChannelMemberListProps> = ({
  socket,
  className = '',
}) => {
  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>(members);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showMemberProfileModal, setShowMemberProfileModal] =
    useState<boolean>(false);

  const handleMemberClick = (member: User) => {
    setSelectedMember(member);
    setShowMemberProfileModal(true);
  };

  const handleMembers = () => {
    const membersHandler = (memberList: User[]) => {
      setMembers([...memberList]);
    };
    socket.emit('find-channel-users', { channelId }, membersHandler);
    setMembers(isTest ? mockUsers : members); // test
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
  };

  const handleSearchResults = () => {
    if (!search) {
      setSearchResults([...members]);
      return;
    }
    const results = members.filter((member) => {
      return member.nickname.startsWith(search);
    });
    setSearchResults([...results]);
  };

  useEffect(() => {
    handleMembers();
  }, []);

  useEffect(() => {
    handleSearchResults();
  }, [members, search]);

  useEffect(() => {
    handleMembers();
  }, [showMemberProfileModal]);

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
        <ModalContainer setShowModal={setShowMemberProfileModal} closeButton>
          <ChannelMemberProfile member={selectedMember} socket={socket} />
        </ModalContainer>
      )}
    </div>
  );
};

export default ChannelMemberList;
