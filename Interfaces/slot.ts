import { Types } from 'mongoose';

export interface slot {
  _id?: Types.ObjectId;
  doctor_id: Types.ObjectId;
  day: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
  created_at?: Date;
  updated_at?: Date;
}

