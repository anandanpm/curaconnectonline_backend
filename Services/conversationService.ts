
import { IConversationService } from "../Interfaces/iConversationService";
import { IConversationRepository } from "../Interfaces/iConversationRepository";
import { TransformedConversation } from "../Interfaces/conversation";
import { conversationRepository } from "../Repository/conversationRepository";

export class ConversationService implements IConversationService {
  constructor(private conversationRepository: IConversationRepository) {}

  async sendMessage(sender: string, receiver: string, text: string): Promise<TransformedConversation> {
    try {
      if (!sender || !receiver || !text) {
        throw new Error('Missing required fields');
      }

      let conversation = await this.conversationRepository.findConversation(sender, receiver);

      const message = { 
        text, 
        sender, 
        seen: false, 
        timestamp: new Date() 
      };

      if (!conversation) {
        conversation = await this.conversationRepository.createConversation(sender, receiver, message);
      } else {
        conversation = await this.conversationRepository.addMessage(conversation._id.toString(), message);
      }

      return conversation;
    } catch (error) {
      console.error("Error in sendMessage service:", error);
      throw error;
    }
  }

  async getMessages(sender: string, receiver: string): Promise<TransformedConversation | {
    _id: null;
    sender: string;
    receiver: string;
    messages: [];
  }> {
    try {
      if (!sender || !receiver) {
        throw new Error('Sender and receiver are required');
      }

      const conversation = await this.conversationRepository.findConversation(sender, receiver);
      
      if (!conversation) {
        return {
          _id: null,
          sender,
          receiver,
          messages: []
        };
      }

      return conversation;
    } catch (error) {
      console.error("Error in getMessages service:", error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService(conversationRepository);
