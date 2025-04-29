
import { IMessage, TransformedConversation } from './conversation';

export interface IConversationRepository {
  findConversation(sender: string, receiver: string): Promise<TransformedConversation | null>;
  createConversation(sender: string, receiver: string, message: Omit<IMessage, '_id'>): Promise<TransformedConversation>;
  addMessage(conversationId: string, message: Omit<IMessage, '_id'>): Promise<TransformedConversation>;
}