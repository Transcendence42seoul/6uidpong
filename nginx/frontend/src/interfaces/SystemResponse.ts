import type Chat from './Chat';
import type Member from './Member';

interface SystemResponse {
  channelId: number;
  chatResponse: Chat;
  channelUsers: Member[];
}

export default SystemResponse;
