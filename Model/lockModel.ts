import mongoose, { Schema, Document } from 'mongoose';
import { Lock } from '../Interfaces/lock';

interface LockDocument extends Omit<Lock, '_id'>, Document {}

const lockSchema = new Schema({
  resource_id: { type: String, required: true },
  resource_type: { type: String, required: true },
  user_id: { type: String, required: true },
  acquired_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
});

// Compound index to ensure we can quickly look up locks by resource type and ID
lockSchema.index({ resource_type: 1, resource_id: 1 }, { unique: true });

const lockModel = mongoose.model<LockDocument>('Lock', lockSchema);
export default lockModel;
