
import mongoose, { Document } from 'mongoose';

export interface message {
  _id?: mongoose.Types.ObjectId;
  text: string;
  sender: mongoose.Types.ObjectId | string;
  seen: boolean;
  timestamp: Date;
}

export interface conversation extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
  messages: message[];
}

export interface Imessage {
  _id?: mongoose.Types.ObjectId | string;
  text: string;
  sender: mongoose.Types.ObjectId | string;
  seen: boolean;
  timestamp: Date;
}

export interface Iconversation extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
  messages: Imessage[];
}

export interface transformedMessage {
  _id: string;
  text: string;
  sender: string;
  seen: boolean;
  timestamp: Date;
}

export interface transformedConversation {
  _id: string;
  sender: string;
  receiver: string;
  messages: transformedMessage[];
}
