import mongoose, { Schema, Document } from 'mongoose';
import { conversation, message } from '../Interfaces/conversation';

const messageSchema = new Schema<message>({
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

const conversationSchema = new Schema<conversation>(
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

const conversationModel = mongoose.model<conversation>('Conversation', conversationSchema);

export default conversationModel;