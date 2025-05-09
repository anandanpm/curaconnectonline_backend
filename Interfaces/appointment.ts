import { Types } from 'mongoose';

export interface appointment {
  populate(arg0: string): unknown;
  save(): unknown;
  _id?: Types.ObjectId;
  slot_id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  refund: number;
  status: 'pending' | 'cancelled' | 'completed';
  payment_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface appointmentData {
  slot_id: string;
  user_id: string;
  amount: number;
  payment_id: string;
  status: string;
}

export interface refundResponse {
  success: boolean;
  message: string;
  refundAmount: number;
  appointmentId: string;
}

export interface dashboardStats {
  totalDoctors: number;
  totalUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  revenueGenerated: number;
}

export interface chartAppointmentStats {
  daily: Array<{ name: string; appointments: number }>;
  weekly: Array<{ name: string; appointments: number }>;
  yearly: Array<{ name: string; appointments: number }>;
}

export interface appointmentDetails {
  date: any;
  _id: any;
  user_id: any;
  slot_id: any;
  doctorName: string;
  doctorId?: string;
  patientId?: string;
  doctorDepartment: string;
  patientName: string;
  startTime: string;
  endTime: string;
  appointmentDate: string;
  status: string;
  appointmentId: string;
  amount?: string;
  refund?: number;
  doctor_id?: any;
  patient_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface appointmentResponse {
  message: string;
  appointment: {
    slot_id: string | any;
    user_id: string | any;
    amount: number;
    payment_id: string;
    status: string;
    _id?: string;
  };
  updatedSlot: {
    doctor_id: string | any;
    day: string;
    start_time: string;
    end_time: string;
    status: string;
    _id: string | any;
  };
}

export interface AppointmentData {
  slot_id: string;
  user_id: string;
  amount: number;
  payment_id: string;
  status: string;
  lockId?: string;
}

export interface AppointmentResult {
  message: string;
  appointment: {
    _id: string;
    [key: string]: any;
  };
  updatedSlot: {
    _id: string;
    [key: string]: any;
  };
}

export interface LockResult {
  success: boolean;
  message: string;
  lockId?: string;
  expiresAt?: Date;
}

