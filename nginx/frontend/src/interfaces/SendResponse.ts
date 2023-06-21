import Chat from './Chat';

interface SendResponse {
  roomId: number;
  channelId: number;
  chatResponse: Chat;
}

export default SendResponse;
