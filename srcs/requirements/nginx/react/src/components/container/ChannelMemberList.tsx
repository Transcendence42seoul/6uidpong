import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import selectSocket from '../../features/socket/socketSelector';
import startsWithIgnoreCase from '../../utils/startsWithIgnoreCase';
import ChannelMemberProfile from './ChannelMemberProfile';
import CircularImage from './CircularImage';
import ModalContainer from './ModalContainer';

import type Member from '../../interfaces/Member';
import type SendResponse from '../../interfaces/SendResponse';

import { isTest, mockUsers } from '../../mock'; // test

interface ChannelMemberListProps {
  className?: string;
}

const ChannelMemberList: React.FC<ChannelMemberListProps> = ({
  className = '',
}) => {
  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { socket } = selectSocket();

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<Member[]>(members);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberProfileModal, setShowMemberProfileModal] =
    useState<boolean>(false);

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setShowMemberProfileModal(true);
  };

  const handleMembers = () => {
    const membersHandler = (memberList: Member[]) => {
      setMembers([...memberList]);
    };
    socket?.emit('find-channel-users', { channelId }, membersHandler);
    setMembers(isTest ? mockUsers : members); // test
  };

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchResults = () => {
    const results = members.filter((member) => {
      return startsWithIgnoreCase(member.nickname, searchTerm);
    });
    setSearchResults([...results]);
  };

  useEffect(() => {
    const chatHandler = ({ chatResponse: chat }: SendResponse) => {
      if (chat.isSystem) {
        handleMembers();
      }
    };
    socket?.on('send-channel', chatHandler);
    return () => {
      socket?.off('send-channel', chatHandler);
    };
  }, []);

  useEffect(() => {
    handleMembers();
  }, []);

  useEffect(() => {
    handleSearchResults();
  }, [members, searchTerm]);

  return (
    <div className={`relative text-gray-50 ${className}`}>
      <input
        type="text"
        placeholder="Search members"
        value={searchTerm}
        onChange={handleSearchTermChange}
        className="w-full border bg-black p-2 shadow focus:outline-none"
      />
      <ul
        className="absolute flex w-full flex-col border-x border-b px-2.5 pb-2 pt-1.5 shadow-md"
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
              className="flex items-end space-x-2 border-b border-gray-300 py-1 hover:bg-gray-500 focus:outline-none"
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
          <ChannelMemberProfile member={selectedMember} />
        </ModalContainer>
      )}
    </div>
  );
};

export default ChannelMemberList;
