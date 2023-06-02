interface Chat {
  id: number;
  roomId: number;
  channelId: number;
  userId: number;
  nickname: string;
  image: string;
  message: string;
  isSystem: boolean;
  createdAt: string;
}

export default Chat;
