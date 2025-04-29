import mongoose, { Schema, Document } from 'mongoose';
import { Conversation, Message } from '../Interfaces/conversation';

const messageSchema = new Schema<Message>({
  text: {
    type: String
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new Schema<Conversation>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

const ConversationModel = mongoose.model<Conversation>('Conversation', conversationSchema);

export default ConversationModel;