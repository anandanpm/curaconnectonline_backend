
import { TransformedConversation } from './conversation';

export interface IConversationService {
  sendMessage(sender: string, receiver: string, text: string): Promise<TransformedConversation>;
  getMessages(sender: string, receiver: string): Promise<TransformedConversation | {
    _id: null;
    sender: string;
    receiver: string;
    messages: [];
  }>;
}
