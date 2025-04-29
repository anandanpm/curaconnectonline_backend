
import mongoose, { Document } from 'mongoose';

export interface Message {
  _id?: mongoose.Types.ObjectId;
  text: string;
  sender: mongoose.Types.ObjectId | string;
  seen: boolean;
  timestamp: Date;
}

export interface Conversation extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
  messages: Message[];
}

export interface IMessage {
  _id?: mongoose.Types.ObjectId | string;
  text: string;
  sender: mongoose.Types.ObjectId | string;
  seen: boolean;
  timestamp: Date;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
  messages: IMessage[];
}

export interface TransformedMessage {
  _id: string;
  text: string;
  sender: string;
  seen: boolean;
  timestamp: Date;
}

export interface TransformedConversation {
  _id: string;
  sender: string;
  receiver: string;
  messages: TransformedMessage[];
}
