import mongoose, { Schema, Document } from 'mongoose';
import { user, userRole } from "../Interfaces/user";

const userSchema = new Schema<user>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: Number, default: null },
  password: { type: String, required: false },
  age: { type: String, default: null },
  profile_pic: { type: String, default: null },
  is_active: { type: Boolean, default: false },
  gender: { type: String, default: null },
  address: { type: String, default: null },
  role: { type: String, enum: Object.values(userRole), default: userRole.PATIENT },
  location: { type: String, default: null },
  clinic_name: { type: String, default: null },
  about: { type: String, default: null },
  verified: { type: Boolean, default: false },
  education: { type: String, default: null },
  experience: { type: String, default: null },
  medical_license: { type: String, default: null },
  department: { type: String, default: null },
  certification: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  otp: { type: String || null },
  otp_expiration: { type: Date || null },
});

const userModel = mongoose.model<user>('User', userSchema);
export default userModel;