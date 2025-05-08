import { Types } from 'mongoose';

export interface medicine {
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

export interface prescription {
  _id?: Types.ObjectId;
  appointment_id: Types.ObjectId | string;
  medicines: medicine[];
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}
