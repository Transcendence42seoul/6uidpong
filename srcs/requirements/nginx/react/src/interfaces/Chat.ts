interface Chat {
  id: number;
  roomId: number;
  userId: number;
  nickname: string;
  image: string;
  message: string;
  createdAt: string;
}

export default Chat;
