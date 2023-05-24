export class DmRoomResponse {
  readonly roomId: number;

  readonly lastMessage: string;

  readonly lastMessageTime: Date;

  readonly interlocutorId: number;

  readonly interlocutor: string;

  readonly interlocutorImage: string;

  readonly newMsgCount: number;
}
