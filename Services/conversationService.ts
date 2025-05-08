
import { IconversationService } from "../Entities/iConversationService";
import { IconversationRepository } from "../Entities/iConversationRepository";
import { transformedConversation } from "../Interfaces/conversation";
import _conversationRepository  from "../Repository/conversationRepository";

export class _conversationService implements IconversationService {
  constructor(private _conversationRepository: IconversationRepository) {}

  async sendMessage(sender: string, receiver: string, text: string): Promise<transformedConversation> {
    try {
      if (!sender || !receiver || !text) {
        throw new Error('Missing required fields');
      }

      let conversation = await this._conversationRepository.findConversation(sender, receiver);

      const message = { 
        text, 
        sender, 
        seen: false, 
        timestamp: new Date() 
      };

      if (!conversation) {
        conversation = await this._conversationRepository.createConversation(sender, receiver, message);
      } else {
        conversation = await this._conversationRepository.addMessage(conversation._id.toString(), message);
      }

      return conversation;
    } catch (error) {
      console.error("Error in sendMessage service:", error);
      throw error;
    }
  }

  async getMessages(sender: string, receiver: string): Promise<transformedConversation | {
    _id: null;
    sender: string;
    receiver: string;
    messages: [];
  }> {
    try {
      if (!sender || !receiver) {
        throw new Error('Sender and receiver are required');
      }

      const conversation = await this._conversationRepository.findConversation(sender, receiver);
      
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

export const conversationServiceInstance = new _conversationService(_conversationRepository);