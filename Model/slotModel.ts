import mongoose, { Schema, Document } from 'mongoose';
import { slot } from "../Interfaces/slot";

const slotSchema = new Schema<slot>({
  doctor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const slotModel = mongoose.model<slot>('Slot', slotSchema);
export default slotModel;