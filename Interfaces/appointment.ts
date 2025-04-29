import { Types } from 'mongoose';

export interface Appointment {
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

export interface AppointmentData {
  slot_id: string;
  user_id: string;
  amount: number;
  payment_id: string;
  status: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  refundAmount: number;
  appointmentId: string;
}

export interface AppointmentDetails {
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

export interface AppointmentResponse {
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

export interface DashboardStats {
  totalDoctors: number;
  totalUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  revenueGenerated: number;
}

export interface ChartAppointmentStats {
  daily: Array<{ name: string; appointments: number }>;
  weekly: Array<{ name: string; appointments: number }>;
  yearly: Array<{ name: string; appointments: number }>;
}