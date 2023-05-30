export const isTest = false;

export const mockChannels = [
  {
    id: 1,
    title: '42seoul_other_pet',
    isLocked: false,
    newMsgCount: 0,
    memberCount: 42,
  },
  {
    id: 2,
    title: '42seoul_other_shouting',
    isLocked: false,
    newMsgCount: 42,
    memberCount: 1234,
  },
];

export const mockUsers = [
  {
    id: 110729,
    nickname: 'kijsong',
    image:
      'https://cdn.intra.42.fr/users/a99b98748e81f651c11c5fa2ccbb753e/kijsong.jpg',
    status: 'online',
    winStat: 1,
    loseStat: 1,
    ladderScore: 1000,
    isOwner: true,
    isAdmin: true,
  },
  {
    id: 110731,
    nickname: 'yoson',
    image:
      'https://cdn.intra.42.fr/users/40840e98c56e893af845a7d2b05e631d/yoson.jpg',
    status: 'offline',
    winStat: 1,
    loseStat: 1,
    ladderScore: 1000,
    isOwner: false,
    isAdmin: true,
  },
  {
    id: 123456,
    nickname: 'wocheon',
    image:
      'https://cdn.intra.42.fr/users/bd9d267e40c02269bbdcd09fe4924419/wocheon.jpg',
    status: 'online',
    winStat: 1,
    loseStat: 1,
    ladderScore: 1000,
    isOwner: false,
    isAdmin: false,
  },
];

export const mockChats = [
  {
    id: 1,
    roomId: 1,
    userId: mockUsers[0].id,
    nickname: mockUsers[0].nickname,
    image: mockUsers[0].image,
    message: 'Hello, there..!',
    createdAt: '2023-05-18 00:25:57.304419',
  },
  {
    id: 2,
    roomId: 1,
    userId: mockUsers[0].id,
    nickname: mockUsers[0].nickname,
    image: mockUsers[0].image,
    message: 'Hello, there..!',
    createdAt: '2023-05-18 00:25:57.304419',
  },
  {
    id: 3,
    roomId: 1,
    userId: mockUsers[1].id,
    nickname: mockUsers[1].nickname,
    image: mockUsers[1].image,
    message: 'Hi~?',
    createdAt: '2023-05-18 00:27:37.593432',
  },
  {
    id: 4,
    roomId: 1,
    userId: mockUsers[1].id,
    nickname: mockUsers[1].nickname,
    image: mockUsers[1].image,
    message: 'How, are, you?!',
    createdAt: '2023-05-18 00:27:44.127905',
  },
];

export const mockFriendRequests = [
  { from: mockUsers[0] },
  { from: mockUsers[1] },
  { from: mockUsers[2] },
];

export const mockLocationState = {
  interlocutorId: mockUsers[1].id,
};

export const mockRooms = [
  {
    roomId: 1,
    lastMessage: mockChats[3].message,
    lastMessageTime: mockChats[3].createdAt,
    interlocutor: mockUsers[1].nickname,
    interlocutorId: mockUsers[1].id,
    interlocutorImage: mockUsers[1].image,
    newMsgCount: 0,
  },
  {
    roomId: 2,
    lastMessage: mockChats[0].message,
    lastMessageTime: mockChats[0].createdAt,
    interlocutor: mockUsers[2].nickname,
    interlocutorId: mockUsers[2].id,
    interlocutorImage: mockUsers[2].image,
    newMsgCount: 42,
  },
];

export const mockTokenInfo = {
  id: mockUsers[0].id,
  nickname: mockUsers[0].nickname,
};

export const mockAuthState = {
  id: null,
  is2FA: null,
  accessToken: null,
  tokenInfo: mockTokenInfo,
};
