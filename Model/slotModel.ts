import mongoose, { Schema, Document } from 'mongoose';
import { Slot } from "../Interfaces/slot";

const slotSchema = new Schema<Slot>({
  doctor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const SlotModel = mongoose.model<Slot>('Slot', slotSchema);
export default SlotModel;