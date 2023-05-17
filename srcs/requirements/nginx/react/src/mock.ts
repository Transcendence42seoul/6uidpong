export const mockLocationState = {
  interlocutorId: 110731,
};

export const mockTokenInfo = {
  id: 110729,
  nickname: 'kijsong',
};

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
  },
];

export const mockChats = [
  {
    id: 0,
    roomId: 'd1',
    userId: mockUsers[0].id,
    nickname: mockUsers[0].nickname,
    image: mockUsers[0].image,
    message: 'Hello, there..!',
    createdAt: '',
  },
  {
    id: 1,
    roomId: 'd1',
    userId: mockUsers[1].id,
    nickname: mockUsers[1].nickname,
    image: mockUsers[1].image,
    message: 'Hi~?',
    createdAt: '',
  },
];
