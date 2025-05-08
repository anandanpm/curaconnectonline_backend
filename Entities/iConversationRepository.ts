
import { Imessage, transformedConversation } from '../Interfaces/conversation';

export interface IconversationRepository {
  findConversation(sender: string, receiver: string): Promise<transformedConversation | null>;
  createConversation(sender: string, receiver: string, message: Omit<Imessage, '_id'>): Promise<transformedConversation>;
  addMessage(conversationId: string, message: Omit<Imessage, '_id'>): Promise<transformedConversation>;
}