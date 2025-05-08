
import mongoose from 'mongoose';
import ConversationModel from "../Model/conversationModel";
import { Iconversation, Imessage, transformedConversation, transformedMessage } from '../Interfaces/conversation';
import { IconversationRepository } from '../Entities/iConversationRepository';

class _conversationRepository implements IconversationRepository {
  transformMessage(msg: Imessage): transformedMessage {
    return {
      _id: typeof msg._id === 'string' ? msg._id : msg._id?.toString() || new mongoose.Types.ObjectId().toString(),
      sender: typeof msg.sender === 'string' ? msg.sender : msg.sender.toString(),
      text: msg.text,
      timestamp: msg.timestamp,
      seen: msg.seen
    };
  }

  transformConversation(conversation: Iconversation): transformedConversation {
    return {
      _id: conversation._id.toString(),
      sender: typeof conversation.sender === 'string' ? conversation.sender : conversation.sender.toString(),
      receiver: typeof conversation.receiver === 'string' ? conversation.receiver : conversation.receiver.toString(),
      messages: conversation.messages.map(msg => this.transformMessage(msg))
    };
  }

  async findConversation(sender: string, receiver: string): Promise<transformedConversation | null> {
    try {
      const conversation = await ConversationModel.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      });

      if (!conversation) return null;

      return this.transformConversation(conversation as unknown as Iconversation);
    } catch (error) {
      console.error("Error finding conversation:", error);
      throw error;
    }
  }

  async createConversation(
    sender: string,
    receiver: string,
    message: Omit<Imessage, '_id'>
  ): Promise<transformedConversation> {
    try {
      const messageWithId: Imessage = {
        _id: new mongoose.Types.ObjectId(),
        ...message
      };

      const conversation = await ConversationModel.create({
        sender,
        receiver,
        messages: [messageWithId]
      });

      return this.transformConversation(conversation as unknown as Iconversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async addMessage(
    conversationId: string,
    message: Omit<Imessage, '_id'>
  ): Promise<transformedConversation> {
    try {
      const messageWithId: Imessage = {
        _id: new mongoose.Types.ObjectId(),
        ...message
      };

      const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        { $push: { messages: messageWithId } },
        { new: true }
      );

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return this.transformConversation(conversation as unknown as Iconversation);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }
}

export default new _conversationRepository();