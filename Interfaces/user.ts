import { Types } from 'mongoose';

export enum userRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export interface user {
  _id?: Types.ObjectId | string;
  username: string;
  email: string;
  phone?: number;
  password?: string;
  age?: number;
  profile_pic?: string;
  is_active?: boolean;
  gender?: string;
  address?: string;
  role: userRole;
  location?: string;
  clinic_name?: string;
  about?: string;
  verified?: boolean;
  education?: string;
  experience?: string;
  medical_license?: string;
  department?: string;
  certification?: string;
  created_at?: Date;
  updated_at?: Date;
  otp?: string | null;
  otp_expiration?: Date | null;
}

export interface signupResponse {
  message: string;
  userId: string
  username: string;
  email: string;
  role: userRole;
}

export interface signupRequest {
  username: string;
  email: string;
  password: string;
  role: userRole;
  _id: string;
}

export interface loginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  isActive?: boolean;
  role: userRole;
  _id?: string;
  gender?: string;
  profile_pic?: string;
  phone?: number;
  age?: number;
  address?: string;
  experience?: string;
  certification?: string;
  department?: string;
  medical_license?: string;
  clinic_name?: string;
  about?: string;
  education?: string;

}

export interface doctorDetails {
  certification?: string;
  department?: string;
  education?: string;
  experience?: string;
  about?: string;
  clinic_name?: string;
  medical_license?: string;
}

export interface doctorLoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  isActive: boolean;
  role: userRole.DOCTOR;
  _id: string;
  profile_pic?: string;
  phone?: number;
  age?: number;
  gender?: string;
  address?: string;
  certification?: string;
  department?: string;
  education?: string;
  experience?: string;
  about?: string;
  clinic_name?: string;
  medical_license?: string;
}

export interface doctorSignupRequest {
  username: string;
  email: string;
  password: string;
  role: userRole.DOCTOR;
}

export interface doctorSignupResponse {
  message: string;
  userId: string;
  username: string;
  email: string;
  role: userRole;
}

export interface doctorSlotRequest {
  doctor_id: string | Types.ObjectId;
  day: any;
  start_time: string;
  end_time: string;
}

export interface doctorAppointment {
  _id?: any;
  doctor_id?: any;
  patient_id?: any;
  slot_id?: any & {
    date?: any;
    start_time: string;
    end_time: string;
  };
  status: string;
  date?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface otpResponse {
  message: string;
}

export interface passwordResetRequest {
  oldPassword: string;
  newPassword: string;
}

export interface adminLoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  role: userRole;
  isActive: boolean;
}

export interface review {
  appointmentId: string | Types.ObjectId;
  rating: number;
  reviewText: string;
  userId: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface reviewResponse {
  message: string;
  reviewId: string;
  appointmentId: string;
  rating: number;
  reviewText: string;
  userId: string;
  createdAt: Date;
}

export interface reviewAdminside {
  _id: string
  appointmentId: string  // Reference to the appointment
  doctorName: string
  doctorId: string
  doctorImage?: string
  patientName: string
  patientId: string
  patientImage?: string
  reviewText: string
  reviewRating: number
  createdAt: string
}

export interface dashboardResponseType {
  stats: {
    totalAppointments: number;
    totalPatients: number;
    averageRating: number;
    totalRevenue: number;
  };
  reviews: {
    reviewId: string;
    rating: number;
    reviewText: string;
    patientName: string;
    createdAt: string;
  }[];
}
