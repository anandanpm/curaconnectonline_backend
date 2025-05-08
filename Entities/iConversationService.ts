
import { transformedConversation } from '../Interfaces/conversation';

export interface IconversationService {
  sendMessage(sender: string, receiver: string, text: string): Promise<transformedConversation>;
  getMessages(sender: string, receiver: string): Promise<transformedConversation | {
    _id: null;
    sender: string;
    receiver: string;
    messages: [];
  }>;
}
