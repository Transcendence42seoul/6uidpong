interface Channel {
  id: number;
  title: string;
  isLocked: boolean;
  newMsgCount: number;
  memberCount: number;
}

export default Channel;
