import { Types } from 'mongoose';

export interface Medicine {
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: number; // number of days
  instructions?: string;
}

export interface Prescription {
  _id?: Types.ObjectId;
  appointment_id: Types.ObjectId | string;
  medicines: Medicine[];
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}
