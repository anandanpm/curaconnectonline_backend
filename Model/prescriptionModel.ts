import mongoose, { Schema, Document } from 'mongoose';
import { Prescription, Medicine } from '../Interfaces/prescription';

const medicineSchema = new Schema<Medicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  },
  duration: { type: Number, required: true },
  instructions: { type: String }
});

const prescriptionSchema = new Schema<Prescription>({
  appointment_id: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  medicines: [medicineSchema],
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field on save
prescriptionSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const PrescriptionModel = mongoose.model<Prescription>('Prescription', prescriptionSchema);
export default PrescriptionModel;