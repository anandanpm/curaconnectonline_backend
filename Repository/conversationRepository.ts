
import mongoose from 'mongoose';
import ConversationModel from "../Model/conversationModel";
import { IConversation, IMessage, TransformedConversation, TransformedMessage } from '../Interfaces/conversation';
import { IConversationRepository } from '../Interfaces/iConversationRepository';

class ConversationRepository implements IConversationRepository {
  transformMessage(msg: IMessage): TransformedMessage {
    return {
      _id: typeof msg._id === 'string' ? msg._id : msg._id?.toString() || new mongoose.Types.ObjectId().toString(),
      sender: typeof msg.sender === 'string' ? msg.sender : msg.sender.toString(),
      text: msg.text,
      timestamp: msg.timestamp,
      seen: msg.seen
    };
  }

  transformConversation(conversation: IConversation): TransformedConversation {
    return {
      _id: conversation._id.toString(),
      sender: typeof conversation.sender === 'string' ? conversation.sender : conversation.sender.toString(),
      receiver: typeof conversation.receiver === 'string' ? conversation.receiver : conversation.receiver.toString(),
      messages: conversation.messages.map(msg => this.transformMessage(msg))
    };
  }

  async findConversation(sender: string, receiver: string): Promise<TransformedConversation | null> {
    try {
      const conversation = await ConversationModel.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      });

      if (!conversation) return null;

      return this.transformConversation(conversation as unknown as IConversation);
    } catch (error) {
      console.error("Error finding conversation:", error);
      throw error;
    }
  }

  async createConversation(
    sender: string,
    receiver: string,
    message: Omit<IMessage, '_id'>
  ): Promise<TransformedConversation> {
    try {
      const messageWithId: IMessage = {
        _id: new mongoose.Types.ObjectId(),
        ...message
      };

      const conversation = await ConversationModel.create({
        sender,
        receiver,
        messages: [messageWithId]
      });

      return this.transformConversation(conversation as unknown as IConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async addMessage(
    conversationId: string,
    message: Omit<IMessage, '_id'>
  ): Promise<TransformedConversation> {
    try {
      const messageWithId: IMessage = {
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

      return this.transformConversation(conversation as unknown as IConversation);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }
}

export const conversationRepository = new ConversationRepository();