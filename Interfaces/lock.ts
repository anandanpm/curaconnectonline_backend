import mongoose from 'mongoose';

export interface Lock {
  _id?: string | mongoose.Types.ObjectId;
  resource_id: string;
  resource_type: string;
  user_id: string;
  acquired_at: Date;
  expires_at: Date;
}