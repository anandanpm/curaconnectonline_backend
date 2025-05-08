import mongoose, { Schema, Document } from 'mongoose';
import { appointment } from "../Interfaces/appointment";

const appointmentSchema = new Schema<appointment>({
  slot_id: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'cancelled', 'completed'],
    default: 'pending'
  },
  payment_id: { type: String },
  refund: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const appointmentModel = mongoose.model<appointment>('Appointment', appointmentSchema);
export default appointmentModel;