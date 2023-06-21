import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import selectAuth from '../../features/auth/authSelector';
import selectSocket from '../../features/socket/socketSelector';
import startsWithIgnoreCase from '../../utils/startsWithIgnoreCase';
import ChannelMemberProfile from './ChannelMemberProfile';
import CircularImage from '../common/CircularImage';
import ModalContainer from '../container/ModalContainer';

import type Member from '../../interfaces/Member';
import type SendResponse from '../../interfaces/SendResponse';

import { isTest, mockUsers } from '../../mock'; // test

interface ChannelMemberListProps {
  role: number;
  setRole: React.Dispatch<React.SetStateAction<number>>;
}

const ChannelMemberList: React.FC<ChannelMemberListProps> = ({
  role,
  setRole,
}) => {
  const { channelId: channelIdString } = useParams<{ channelId: string }>();
  const channelId = Number(channelIdString);

  const { tokenInfo } = selectAuth();
  const myId = tokenInfo?.id;

  const { socket } = selectSocket();

  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<Member[]>(members);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberProfileModal, setShowMemberProfileModal] =
    useState<boolean>(false);

  const setMyRole = (memberList: Member[]) => {
    const myInfo = memberList.find((member) => member.id === myId);
    if (!myInfo) return;
    const { isAdmin, isOwner } = myInfo;
    const myRole = Number(isAdmin) + Number(isOwner);
    setRole(myRole);
  };

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setShowMemberProfileModal(true);
  };

  const handleMembers = async () => {
    const membersHandler = async (memberList: Member[]) => {
      setMembers([...memberList]);
      setMyRole(memberList);
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
    const chatHandler = async ({ chatResponse: chat }: SendResponse) => {
      if (chat.isSystem) {
        await handleMembers();
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
    <div className="relative text-gray-50">
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
          const { nickname, image } = member;
          let memberRole = '';
          if (member.isOwner) {
            memberRole = 'Owner';
          } else if (member.isAdmin) {
            memberRole = 'Admin';
          }
          return (
            <button
              key={nickname}
              className="flex items-end space-x-2 border-b border-gray-300 py-1 hover:bg-gray-500 focus:outline-none"
              onClick={() => handleMemberClick(member)}
            >
              <CircularImage src={image} alt={nickname} className="h-6 w-6" />
              <span className="w-2/3 truncate text-left">{nickname}</span>
              <span className="ml-auto text-sm">{memberRole}</span>
            </button>
          );
        })}
      </ul>
      {selectedMember && showMemberProfileModal && (
        <ModalContainer setShowModal={setShowMemberProfileModal} closeButton>
          <ChannelMemberProfile member={selectedMember} role={role} />
        </ModalContainer>
      )}
    </div>
  );
};

export default ChannelMemberList;
