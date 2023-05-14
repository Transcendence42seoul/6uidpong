export class DmRoomsResponseDto {
  roomId: number;

  lastMessage: string;

  lastMessageTime: Date;

  interlocutorId: number;

  interlocutor: string;

  interlocutorImage: string;

  newMsgCount: number;
}
